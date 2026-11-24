# P441 — Phase Status

## Export Worker Alerting & Operational Recovery

**Status:** Implemented; source verifiers passed. Runtime alert delivery remains unverified.

### Delivered
- Independent document-scan worker monitors reminder-policy audit export worker heartbeat.
- Stale heartbeat and sustained degraded states create CRITICAL alerts in OperationsAlertOutbox.
- Healthy transition emits recovery INFO alert for stale/degraded state.
- Hourly dedupe keys reduce alert flooding.
- Thresholds configurable: stale age defaults 120 seconds (bounded 60–3600); consecutive degraded failures defaults 3 (bounded 1–20).
- Alert payload contains worker diagnostics only; no school/user PII.

### Modified
- `backend/api/src/workers/document-scan-worker.ts`
- `backend/api/src/modules/operations/alert-contract.ts`
- `backend/api/src/config/env.ts`
- `scripts/verify-p441-export-worker-alerting.mjs`
- `backend/api/package.json` (`verify:p441`)

### Open validation gaps
- DB-backed alert outbox insertion and webhook delivery runtime not exercised.
- Multi-instance document-scan-worker alert monitor behavior not load-tested.
- Monitor state is process-local; after monitor restart, transition context is lost.
- Recovery event requires the monitor and export worker to be running and reporting HEALTHY.
- Full workspace build, database migration/Prisma validation, and browser/mobile E2E remain pending.
