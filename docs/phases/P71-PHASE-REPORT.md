# P71 — Runtime Readiness and Graceful Shutdown

## Delivered
- Concurrent PostgreSQL and Redis readiness probes with bounded timeout and safe status output.
- HTTP 503 on dependency failure.
- Graceful HTTP server, Prisma and readiness Redis shutdown with bounded force-exit.
- Unit-test source and static verifier.

## Acceptance still required
- Run Vitest and semantic typecheck/build.
- Start PostgreSQL and Redis, verify ready transitions 200→503→200 when dependencies stop/recover.
- Verify `/health/live` remains 200 during dependency outage.
- Send SIGTERM/SIGINT with active requests and verify clean process exit and pool disconnection.
- Confirm all BullMQ workers are separately drained/stopped before production readiness; P71 does not claim worker shutdown coverage.
