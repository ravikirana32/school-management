# P36 phase report — Homework submissions and parent inbox count

## Delivered

- Added `HomeworkSubmission` Prisma model and additive PostgreSQL migration with composite tenant FKs, assignment/student uniqueness, score and grading-state checks, indexes, and forced RLS.
- Added parent text submission/resubmission for published homework where the parent has active portal consent and a verified link to the child.
- Added permission-gated operator submission listing and grading with score/max-score validation, feedback, grader identity, timestamp and audit event.
- Extended parent homework read data with submission status and teacher feedback/score.
- Added parent notification unread-count endpoint scoped to recipient and currently consented child links.
- Updated root and `docs/` master gap registers; added module, API, security, acceptance and artifact manifest docs.

## Explicitly deferred

- Homework private attachment upload/scanning, rubrics, teacher mobile grading UI, submission history/reopen and offline queue.
- Board/grade report-card schema versioning, approval lifecycle and private PDF generation.
- Notification batches, delivery preferences, provider outbox/receipts/retries/dead-letter, notification pagination and retention.
- Payment gateway selection and implementation: no commercial provider decision exists; manual reconciliation remains unchanged.
- P35 cursor snapshot semantics, query plans and k6 load evidence.

## Verification

- TypeScript syntax transpilation: PASS 1/1 changed backend TypeScript file. Static source assertions: PASS 12/12.
- Static source assertions: recorded in artifact manifest.
- Prisma validation/generation, migration apply/rollback, PostgreSQL/RLS/API integration, Vitest, full typecheck/build, Playwright, Expo E2E and k6: NOT RUN.
- Runtime acceptance: NOT VERIFIED.
