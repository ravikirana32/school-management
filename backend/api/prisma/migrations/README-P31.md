# P31 migration notes

1. Apply P30 first; P31 adds consent notice text, consent withdrawal timestamp, private delivery-worker and document-scan-worker RLS policies, scan-request timestamps, and parent portal lookup indexes.
2. Pending P30 invitations are revoked and encrypted payloads cleared because P30 did not persist the exact consent notice text. Parents must receive a new invitation containing the notice.
3. The parent delivery worker uses `withParentWorkerContext`; the document scan worker uses `withDocumentWorkerContext`. Deploy them as separate processes with dedicated database credentials. Do not expose worker-only context helpers through HTTP handlers.
4. Run workers only after configuring Redis, S3, `PARENT_EMAIL_PROVIDER_URL`, `PARENT_EMAIL_PROVIDER_TOKEN`, `PARENT_EMAIL_FROM`, `PARENT_PORTAL_BASE_URL`, `DOCUMENT_SCANNER_PROVIDER_URL`, `DOCUMENT_SCANNER_PROVIDER_TOKEN`, `DOCUMENT_SCAN_CALLBACK_URL` and `DOCUMENT_SCAN_WEBHOOK_SECRET`.
5. Run RLS tests with real non-owner API and worker credentials. Custom GUC policies are defense in depth, not a substitute for credential separation.
6. Run the idempotent Prisma seed before accepting invitations so the PARENT role and parent permissions exist.
7. Existing accepted P30 invitations have no historical consent notice text; the migration backfills a generic placeholder. This historical limitation must be disclosed and reviewed before any re-consent or compliance assertion.
