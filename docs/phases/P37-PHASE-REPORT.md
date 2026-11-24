# P37 phase report — Homework attachments and teacher grading

## Delivered

- Added tenant-owned `HomeworkSubmissionAttachment` and `HomeworkSubmissionGradeEvent` models, rubric JSON storage, composite foreign keys, forced RLS, scanner lookup/worker policies, indexes and immutable grade-event trigger.
- Extended private document upload completion, malware scan worker/queue/callback and signed-download pipeline for homework attachments.
- Parent upload requires active linked guardian consent and a published assignment; upload is quarantined until scan approval.
- Teacher homework listing filters to active assigned classes for linked staff profiles. Submission listing, grading, history and reopen enforce the same class mapping.
- Added rubric criteria input, score/max-score bounds, append-only grade/reopen history and controlled reopen reason.
- Added Teacher mobile homework list, submission review, score and feedback UI using existing authenticated API client.
- Updated root/docs gap register and project status docs.

## Deferred

- Board/grade/academic-year report-card schema versioning, approvals and private PDF generation.
- Versioned school rubric catalogue, weighted score calculation and subject-level authorization (assignment model lacks subject ID).
- Parent mobile attachment download UI, offline grading and autosave.
- Notification batches, preferences, provider outbox/receipts/retries/dead-letter and retention.
- Payment provider decision and gateway integration.
- P35/P36 cursor watermark semantics, EXPLAIN plans and k6 evidence.

## Verification performed

- TypeScript syntax transpilation: PASS 6/6 changed TS/TSX files (document routes, scan queue, scan worker, parent routes, seed source and teacher mobile app).
- Targeted static source assertions: PASS 16/16; artifact manifest JSON and root/docs gap-register parity: PASS.
- Prisma validation/generation, migration apply/rollback, PostgreSQL/RLS/API integration, Vitest, full typecheck/build, S3/Redis/scanner provider, Playwright, Expo device E2E and k6: NOT RUN.
- Runtime acceptance: NOT VERIFIED.

## Operational prerequisites

- Configure private S3-compatible storage and HTTPS scanner provider/callback credentials.
- Deploy document scan worker with restricted worker DB credentials and Redis.
- Configure scanner to return exact detected MIME type and signed HMAC callback.
- Apply P37 migration only after P36.
