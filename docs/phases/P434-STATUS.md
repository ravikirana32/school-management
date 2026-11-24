# P434 — Large Reminder Audit Export Jobs

## Status
Source implementation completed. Focused verifier: **26/26 PASS**. TypeScript transpile syntax diagnostics: 0 for changed API route, worker, and School Admin TSX. Docker Compose YAML parses.

## Delivered
- Database-backed export-job lifecycle: QUEUED, PROCESSING, COMPLETED, FAILED, EXPIRED.
- Permission-gated export-job request, owner-only status and download endpoints, tenant/school scoped.
- Filter snapshot (action, actor, date range) retained with export job.
- Worker atomically claims queued jobs, queries audit records under tenant context, escapes CSV, caps one job at 50,000 rows.
- CSV retained in database, expires after 24 hours; completed content purged on expiry.
- Stale queued/processing jobs are marked EXPIRED after 24 hours.
- School Admin can queue a large export, view status with auto-refresh, and download when complete; existing immediate export (max 1,000) remains.
- Production compose worker service and npm worker/verifier scripts registered.

## Verification
- P434 focused verifier 26/26 PASS.
- P433 17/17 PASS; P432 21/21 PASS.
- TypeScript transpile diagnostics: API routes 0, export worker 0, Admin TSX 0.
- Compose YAML parse PASS.

## Not runtime-verified
Prisma validate/generate, migration execution, full build/typecheck, PostgreSQL runtime/RLS integration, multi-worker concurrency acceptance, browser E2E, and actual large-export download remain pending. Exports currently cap at 50,000 audit rows per job.
