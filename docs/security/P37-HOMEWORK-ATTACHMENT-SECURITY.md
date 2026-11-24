# P37 homework attachment security

- Submission ownership is enforced with composite `(submissionId, organizationId, schoolId)` foreign keys and forced RLS.
- Attachment object keys are server-generated under `quarantine/{org}/{school}/homework/{uuid}`; clients cannot select keys.
- Upload requires parent homework permission, active school membership, an active guardian, a linked student with communications enabled, and accepted non-withdrawn consent.
- Presigned upload restricts content type, object metadata/document ID and 25 MiB size. Completion verifies HEAD metadata before quarantine.
- Scanner callback requires HTTPS deployment, HMAC-SHA256 over timestamp + raw body, five-minute clock skew and an exact quarantined object-key match. MIME mismatch is rejected and deleted.
- Clean files are promoted to a private key; rejected files are deleted. Signed download is 60 seconds and requires CLEAN status.
- Parent download requires current consent and child link. Staff users with `academics.manage` must have an active linked staff profile and a matching active teacher assignment; staff without a linked profile follow the permission-gated operator path.
- Grade history is append-only via database trigger; grade/reopen operations are audited.
- Scanner worker RLS policies allow only QUARANTINED homework attachment discovery and scan timestamp updates.

Runtime RLS, callback, S3, scanner and authorization tests remain pending. Provider configuration and deployment database roles must be reviewed before production.
