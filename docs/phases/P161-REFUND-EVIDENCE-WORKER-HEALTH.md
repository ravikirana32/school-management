# P161 — Refund Evidence Worker Health and Retry Operations

## Delivered
- Durable document-worker heartbeat state in `BackgroundWorkerHeartbeat`.
- Startup and periodic liveness updates with last success/error metadata.
- Capped exponential retry scheduling for failed abandoned-upload cleanup.
- Indexed due-retry selection and successful-cleanup metadata reset.
- Finance dashboard worker health, heartbeat staleness and alert indicators.
- Per-evidence next retry visibility.

## Acceptance limitations
Migration/build/runtime checks have not been executed. External alert delivery is not implemented; alerts are visible in the authenticated dashboard and structured worker logs. Automated test authoring/execution remains deferred.
