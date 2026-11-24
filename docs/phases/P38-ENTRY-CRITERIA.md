# P38 entry criteria

1. Implement versioned report-card schemas by board, grade and academic year; validate subjects, assessment components and score boundaries.
2. Add principal/authorized approval lifecycle, immutable approval history and private PDF generation/storage/download.
3. Add school-managed versioned homework rubrics and subject-level teacher assignment authorization.
4. Add parent mobile attachment upload/download/scan status UI and teacher mobile rubric editor, offline draft handling and submission history.
5. Implement notification batches, per-user/category preferences, consent-aware transactional outbox, provider receipts, retry/dead-letter and parent inbox pagination/retention.
6. Define P35/P36 cursor snapshot/watermark semantics; capture EXPLAIN plans and k6 evidence.
7. Select payment provider only after explicit commercial approval; do not invent gateway behavior.
8. Run Prisma validation, migration apply/rollback/reapply, PostgreSQL RLS/API tests as non-owner, Vitest, full typecheck/build, Playwright and Expo iOS/Android E2E.
9. Carry every unresolved P00–P37 gap forward; close only with reproducible implementation and verification evidence.
