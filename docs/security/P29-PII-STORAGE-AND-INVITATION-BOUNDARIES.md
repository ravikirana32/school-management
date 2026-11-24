# P29 PII, storage and invitation boundaries

- Guardian list/detail/update requires `students.pii.read` and the corresponding student read/update permission.
- PII reads and guardian writes create audit events in the tenant transaction.
- Student and staff document metadata endpoints must not be mistaken for upload/download support. P29 does not issue object keys, signed URLs or public URLs.
- Parent invitations are deferred until verified contact ownership and a dedicated invitation/account-link lifecycle are designed. A guardian email field alone is not verification.
- Production rollout requires private object storage, signed short-lived access, malware scanning/quarantine, file signature/content-type validation, retention/deletion policy and access audit.
- Database migrations and authorization must be tested with a non-owner application DB role; source-level tenant filters are not a substitute for RLS runtime tests.
