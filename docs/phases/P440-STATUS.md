# P440 — Export Worker Monitoring, Metrics & Alert Readiness

## Status
Implemented source-level worker heartbeat persistence and monitoring visibility.

## Changes
- Reuses the existing `BackgroundWorkerHeartbeat` table.
- Worker records `STARTING`, `HEALTHY`, and `DEGRADED` states.
- Healthy cycle completion records a heartbeat and last-success timestamp.
- Cycle errors persist degraded state and bounded error-code metadata.
- Heartbeats refresh independently of processing cycles using a configurable interval.
- Health endpoint exposes worker status, heartbeat age, last success/error, and consecutive failures.
- Missing heartbeat is reported as `UNKNOWN`; heartbeat older than 90 seconds is `STALE`.
- Admin Export Operations Health panel displays worker status and basic heartbeat/error diagnostics.
- Worker shutdown clears the heartbeat timer.

## Configuration
`REMINDER_AUDIT_EXPORT_WORKER_HEARTBEAT_INTERVAL_MS=30000` (bounded to 10–60 seconds).

## Limitations
- Job outcome counters and cycle-duration metrics are process-local and currently emitted to worker logs; they are not persisted as historical metrics.
- No alert routing is added for this worker in P440.
- No live DB/API, multi-process runtime, full build, or browser/mobile E2E validation was performed.
