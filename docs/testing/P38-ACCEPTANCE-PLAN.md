# P38 acceptance plan

1. Validate Prisma schema and generate client; compile API; run Vitest.
2. Apply migration to PostgreSQL; verify partial unique active-schema index, composite FKs and forced RLS.
3. Connect as a non-owner role; verify cross-org/school schema, report, event and artifact reads/writes are denied.
4. Create two schema versions for same school/year/grade/board; activate the second; confirm first is retired and concurrent activation is rejected by unique index.
5. Validate rejection of unknown board, year, grade, student enrollment, subject, component, missing score, negative score and score above max.
6. Confirm author cannot approve own report; principal can approve/reject; rejection requires reason; duplicate/invalid transitions return conflict.
7. Publish approved report; inspect PDF with a PDF parser; verify SHA-256 and bytes; confirm private bucket object and short-lived signed download.
8. Verify parent download denied for unlinked child, withdrawn consent, unaccepted invitation, wrong tenant and unpublished report; allow accepted linked parent only.
9. Run Playwright and mobile parent portal tests after the report-card UI is added; run S3 integration tests against isolated bucket.
10. Run migration rollback/reapply using a documented backup-preserving strategy. P38 intentionally provides no destructive down migration.

## Source-level tests

`report-card-pdf.test.ts` checks PDF signature, content and escaping. It is authored but not run because dependencies are not installed in this environment.
