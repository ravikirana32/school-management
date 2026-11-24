# P30 migration notes

Migration: `20261117120000_p30_parent_documents_employment`.

Pre-deployment requirements:
1. Back up the database and run the employment overlap preflight query on a restored snapshot.
2. Resolve all invalid (`endsOn < startsOn`) and overlapping `StaffEmploymentHistory` date ranges. The migration raises an exception rather than rewriting history.
3. Confirm the migration role can install/use `btree_gist`; coordinate extension installation with the database administrator if needed.
4. Apply the migration in a staging environment and verify RLS lookup policies using the actual non-owner application role.
5. Configure a private S3-compatible bucket, least-privilege IAM, encryption at rest, public access block and lifecycle policy before enabling document uploads.
6. Configure `PARENT_INVITE_ENCRYPTION_KEY` as a base64-encoded 32-byte key and protect/rotate it through the deployment secret manager.
7. Configure `DOCUMENT_SCAN_WEBHOOK_SECRET` and integrate an external scanner. Do not mark documents CLEAN from an admin UI or direct API.

Rollback should be performed only after preserving invitation audit records and ensuring no accepted guardian links depend on newly created account links. No automated down migration is supplied because removing verified account links or clean document state can cause data loss.
