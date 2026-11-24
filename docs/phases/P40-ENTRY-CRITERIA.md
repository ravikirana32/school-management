# P40 entry criteria

1. Add searchable academic-year/grade/board/subject pickers and a visual schema editor with version diff and activation preview.
2. Add report-card draft creation/editing UI and student selection/grade lookup; retain API schema validation and author separation.
3. Add report-card notifications through a durable consent-aware transactional outbox, batch fanout, preferences, retries and receipts.
4. Add branded multi-page PDF templates, localized font support, page breaks, signatures, QR verification and accessible layout.
5. Improve parent mobile PDF experience with explicit expiry/retry messaging and attachment download state; test consent withdrawal semantics.
6. Publish reviewed board assessment packs with provenance and controlled version updates; do not imply regulatory endorsement.
7. Add database/API/browser/device tests for P38/P39; run Prisma, PostgreSQL non-owner RLS, S3, Vitest, full builds/typecheck, Playwright and Expo E2E.
8. Continue payment provider decision, notification lifecycle, homework rubric versioning, cursor snapshot semantics, EXPLAIN and k6.
9. Carry every unresolved P00–P39 gap forward; close only with reproducible implementation and verification evidence.
