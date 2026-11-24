# P436 — Export Job Operational Observability & Admin Diagnostics

## Delivered source slice
- Added permission-gated (`academics.manage`) export-health endpoint, scoped to organization and school.
- Aggregates export-job status counts, queued backlog and oldest queued age, active processing count and maximum attempt count.
- Calculates average duration from up to the latest 200 completed export jobs with valid start/completion timestamps.
- Provides failure-code counts for failed jobs completed in the last 24 hours (bounded sample of 100); no stack traces or raw exception messages exposed.
- Added School Admin export operations health panel with refresh, queue/status counters, backlog age, duration sample and recent failure codes.
- Metrics refresh on workspace load and can be refreshed manually.

## Verification
- P436 focused source verifier: 18/18 PASS.
- Regression verifiers: P435 21/21, P434 26/26, P433 17/17, P432 21/21 PASS.
- TypeScript transpile syntax diagnostics: curriculum API route 0; School Admin TSX 0.

## Runtime gaps
- Live PostgreSQL, Prisma, RLS, role authorization and endpoint runtime acceptance not executed.
- Full workspace build/typecheck and browser/mobile E2E remain open.
- Worker heartbeat and external metrics/alerting are not included; this phase exposes school-scoped DB-derived health metrics only.
- Failure metrics are bounded samples and should not be interpreted as exact totals for very high failure volumes.
