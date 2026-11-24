# P37 acceptance plan

## API and database

1. Run Prisma validate/generate and apply P00–P37 migrations to a clean PostgreSQL database.
2. Repeat apply/restart and exercise rollback on a disposable database; verify composite FKs, indexes, forced RLS and scanner worker policies.
3. Use non-owner application and worker roles. Prove tenant/school isolation for submissions, attachments and grade events.
4. Test parent upload with accepted consent, withdrawn consent, unrelated child, inactive guardian, wrong school, oversize object, MIME mismatch, bad S3 metadata and expired upload.
5. Test scanner callback signature, timestamp skew, object-key mismatch, duplicate callback, clean promotion, rejection/deletion and worker retry/dead-letter.
6. Test parent/teacher download for CLEAN vs QUARANTINED/REJECTED, revoked consent, unrelated child, inactive staff, wrong class and wrong tenant.
7. Test teacher class filtering, score boundaries, rubric count/criterion bounds, duplicate grading, reopen reason, append-only history and audit events.
8. Test concurrent parent submissions and concurrent grading/reopen operations.

## Apps and performance

1. Run Vitest, full TypeScript typecheck and all web/mobile builds.
2. Playwright parent upload/submission/feedback and School Admin teacher assignment scenarios.
3. Expo iOS/Android teacher sign-in, school switching, homework load, grading, refresh expiry and sign-out.
4. Validate parent app attachment metadata and signed download behavior.
5. Capture EXPLAIN (ANALYZE, BUFFERS) for teacher assignment filtering and submission/attachment lists; run k6 at representative school sizes.

None of these runtime acceptance tests have been run as part of P37.
