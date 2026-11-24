# P435 — Export Job Management & Recovery Controls

## Delivered source slice
- Added an owner/tenant/school-scoped export-job history endpoint (latest 20, bounded to 50).
- Added cancellation for queued jobs only; cancellation is represented as `EXPIRED` with `CANCELLED_BY_REQUESTER` because the existing enum has no `CANCELLED` state.
- Added retry for failed jobs, resetting status, attempt counter, and stale output metadata.
- Added `attemptCount` with a database constraint limiting it to 0–3.
- Worker claims increment attempt count; processing jobs stale for 10 minutes are recovered to `QUEUED` until three attempts, then marked `FAILED`.
- School Admin displays recent export jobs with refresh, cancel, retry, and download actions.

## Verification
- P435 focused verifier: 21/21 PASS.
- P434 regression: 26/26 PASS.
- TypeScript transpile syntax diagnostics: API routes 0, export worker 0, School Admin TSX 0.
- P433/P432/P431 regression checks run separately and recorded in delivery report.

## Runtime gaps
Full Prisma validation/client generation, PostgreSQL migration/runtime, RLS, multi-worker recovery under load, full workspace build/typecheck, and browser/mobile E2E remain unverified.

## Decisions / limitations
- Cancelled jobs use `EXPIRED` status plus a cancellation error code; a dedicated `CANCELLED` enum/status requires a future schema/API compatibility phase.
- Stale processing recovery is source-implemented; no runtime crash-recovery simulation was executed.
- Retry is requester-scoped and only available for `FAILED` jobs.
