# P30 — Parent Identity, Private Documents & Data Integrity

## Parent invitation lifecycle
- School Admin can create a guardian invitation only for an active guardian with an email address and both `students.pii.read` and `students.update` permissions.
- Invitation tokens are 48-byte opaque random values. Only SHA-256 token hashes are used for lookup; the delivery payload (email + raw token) is encrypted using AES-256-GCM with a dedicated 32-byte base64 key.
- Invitations expire after 48 hours, can be revoked, and only one PENDING invitation is allowed per guardian.
- Guardian consent is captured on the public acceptance step, not by the staff member creating the invitation. Consent notice version must match the invitation version.
- Acceptance proves control of the invited email address, creates a verified user account or verifies/links an existing account using the single-use email possession token, and links the account to the guardian record.
- Parent school membership and portal permissions are intentionally not provisioned yet; this phase does not expose student records to the newly linked account.
- The database stores an encrypted delivery payload with `deliveryStatus=QUEUED`. A production email delivery worker/provider is not included in P30.

## Guardian merge
- Preview is read-only and reports source/target records, linked students, duplicate links and account conflicts.
- Merge requires explicit confirmation and `students.update` plus `students.pii.read`.
- All source student links are moved or combined transactionally; relationship flags are merged conservatively using OR for primary/emergency/pickup/communications flags.
- Pending invitations for the source guardian are revoked. The source guardian is deactivated and retains `mergedIntoGuardianId` for traceability.
- Different linked user accounts or mismatched target email/account identity block the merge. No fuzzy or automatic merge is performed.

## Private document lifecycle
1. Authenticated user requests an upload URL for an in-scope student/staff record.
2. API validates permission, supported MIME declaration and maximum 25 MiB size, creates a PENDING_UPLOAD metadata row and signs a 5-minute PUT URL under a quarantine key.
3. Client uploads directly to private S3-compatible storage.
4. Completion endpoint HEAD-checks object id metadata, content type and exact size; successful objects become QUARANTINED.
5. External malware scanner submits a raw-body HMAC-authenticated callback including verdict and detected MIME type.
6. CLEAN objects are promoted to the private prefix; rejected objects are deleted. Only CLEAN records receive 60-second signed download URLs.

Supported declared types: PDF, JPEG and PNG. Bucket public access must be blocked and server-side encryption enabled by deployment configuration. The scanner itself and its queue/worker integration are external dependencies, not implemented here.

## Employment history and access audit
- P30 migration preflights arbitrary date-range overlaps and adds a PostgreSQL GiST exclusion constraint using `btree_gist`.
- Access audit endpoint now uses cursor pagination, up to 100 rows per page.
