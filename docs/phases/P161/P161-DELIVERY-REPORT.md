# P161 Delivery Report — Refund Evidence Worker Health and Retry Operations

- Added durable `BackgroundWorkerHeartbeat` records with worker status, last heartbeat, last successful sweep, last error, error code and consecutive failure count.
- Document worker publishes a startup heartbeat and recurring liveness heartbeats; expiry sweep outcomes update worker health and failures emit structured operational logs.
- Added `cleanupNextRetryAt` and an indexed due-retry query for abandoned refund evidence cleanup.
- Cleanup failures now use capped exponential retry scheduling (60 seconds doubling to a maximum of six hours); successful cleanup clears failure and retry metadata.
- School Admin Finance operations dashboard now surfaces worker heartbeat age, status, consecutive failures and an alert state when the worker is missing/stale/degraded or has repeated failures.
- Evidence rows expose next cleanup retry time alongside attempt count and last error.
- Added migration `20261118240000_p161_refund_evidence_worker_health`.
- Unit/API/end-to-end test authoring and execution remain deferred per project instruction. Migration application, Prisma generation, builds, PostgreSQL/Redis/object-storage/scanner runtime and alert delivery were not executed.

## P161-G001 — PARTIALLY_IMPLEMENTED

Worker heartbeat persistence, retry scheduling and dashboard alert indicators are implemented in source. Remaining acceptance: apply migration, generate Prisma client, run API/School Admin builds and verify heartbeat freshness/stale detection, retry backoff, worker restarts, cleanup races, database availability and alert visibility against deployed PostgreSQL, Redis and object storage. Alerting is currently surfaced in the authenticated Finance operations dashboard and structured logs; external notification delivery is not included.
