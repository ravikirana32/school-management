# P578 Reliability, Operations & Disaster Recovery Acceptance

## Evidence boundary
This phase adds bounded worker shutdown, a safe k6 health-endpoint smoke profile
and operational runbooks. No load test, backup, restore, failover or RPO/RTO
exercise is claimed as executed in this environment.

## Worker shutdown
`createWorkerShutdown` stops scheduling, then attempts worker drain, queue close
and database disconnect in order. Each asynchronous step is bounded (10 seconds
by default). Cleanup continues after failure/timeout; all failures are surfaced
as an AggregateError. The shutdown promise is idempotent across overlapping
SIGINT/SIGTERM requests.

A timeout does not cancel an underlying operation. Implementations must make
close/drain calls safe to continue in the background and the process supervisor
must enforce a final hard termination deadline. Review each worker's BullMQ
`close()` behavior and active job idempotency before production rollout.

## Load smoke
Run only against a dedicated staging/test environment:
```bash
K6_BASE_URL=https://staging.example.invalid k6 run tests/load/api-smoke.k6.js
```
Override `K6_VUS` and `K6_DURATION` only after defining an approved load envelope.
The included profile is a small health endpoint smoke, not a capacity benchmark.
Do not point it at production or use real student data. Initial thresholds
(p95 < 1.5s, failed requests < 1%) are provisional guardrails and must be
replaced by product-approved SLOs before release sign-off.

## Backup and restore
1. Define business-approved RPO/RTO and retention per tenant/data class.
2. Take encrypted PostgreSQL backups using approved age identity/recipient secret
   files; never put keys or database URLs in command history.
3. Back up Redis only for state that the application contract requires to survive;
   rebuild ephemeral queues from PostgreSQL/outbox records where supported.
4. Store checksums and backup metadata separately; alert on age, size anomalies
   and failed jobs.
5. Restore into an isolated network/database, never over production.
6. Run `pg_restore --list`, restore, migration status, row-count/foreign-key checks,
   RLS catalog checks, tenant-isolation probes and representative read workflows.
7. Record measured recovery time, data-loss window, operator, artifact checksum
   and exceptions. A backup is not accepted until restore is proven.

## Failure and recovery drills
- PostgreSQL restart/failover while API and workers are active.
- Redis restart and BullMQ reconnect; ensure no duplicate financial/notification side effects.
- Worker SIGTERM during active job; verify lease expiry/reclaim and idempotent retry.
- Provider timeout/rate-limit and dead-letter replay with audit.
- Disk pressure, backup storage outage, expired TLS and secret rotation.
- Confirm readiness goes false during dependency outage and recovers only after checks pass.

## Observability
Use existing Prometheus request metrics, structured operational events and
readiness/liveness endpoints. Alert on sustained 5xx/latency, queue age/depth,
dead-letter growth, expired leases, outbox retry age, DB pool saturation,
Redis disconnects, backup age/failure and disk pressure. Avoid student identifiers,
raw URLs, secrets and payloads in metric labels/logs.

## P578 execution gates
- pnpm 9.15.0 lockfile and frozen install.
- Prisma validate/generate and PostgreSQL clean/upgraded migration tests.
- All app/package typechecks and builds.
- RLS restricted-role/cross-tenant acceptance.
- Approved SLO, load environment, backup credentials and isolated restore target.
- Reproducible evidence bundle with sanitized logs and measured RPO/RTO.

## Status
Static/source foundation only. k6, Docker, PostgreSQL, Redis, backup, restore,
load, failover, worker soak and RPO/RTO drills are NOT RUN.
