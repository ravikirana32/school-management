# P441 — Delivery Report

P441 adds operational alerting for the reminder-policy audit export worker. The document-scan worker independently reads the export worker heartbeat and emits deduplicated outbox events for stale and sustained degraded states. When the export worker returns to HEALTHY after an observed degraded/stale state, a recovery event is enqueued.

### Alert events
- `REMINDER_AUDIT_EXPORT_WORKER_STALE` — CRITICAL
- `REMINDER_AUDIT_EXPORT_WORKER_DEGRADED` — CRITICAL
- `REMINDER_AUDIT_EXPORT_WORKER_RECOVERED` — INFO
- `REMINDER_AUDIT_EXPORT_WORKER_RECOVERED_FROM_STALE` — INFO

### Config
```env
REMINDER_AUDIT_EXPORT_WORKER_ALERT_STALE_SECONDS=120
REMINDER_AUDIT_EXPORT_WORKER_ALERT_DEGRADED_FAILURES=3
```

Events flow through the existing OperationsAlertOutbox delivery/retry infrastructure. This phase does not claim successful live webhook delivery.
