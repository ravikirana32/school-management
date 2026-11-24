# P451 Test Report

## Source verifiers
- P451 focused: **18/18 PASS**
- P450 regression verifier updated for new channel preference behavior: **14/14 PASS**
- P449 regression: **14/14 PASS**
- P448 regression: **14/14 PASS**
- Total selected current verifiers: **60/60 PASS**

## Syntax diagnostics
- `backend/api/src/modules/platform/platform.routes.ts`: 0
- `backend/api/src/workers/document-scan-worker.ts`: 0
- `apps/super-admin/src/main.tsx`: 0

## Legacy verification caveats
- P447 verifier: 4/12 due to obsolete expectations from earlier configuration/worker design.
- P446 and P445 verifiers fail due to path-resolution errors. These are recorded as stale/broken and are not counted as passes.

## Not performed
No live PostgreSQL migration/queries, provider webhook delivery, multi-worker concurrency, full workspace typecheck/build, or browser/mobile E2E was run.
