# P447 Delivery Report

## Scope
Policy configurability and reliable SLA automation event creation.

## Implementation summary
The alert worker now reads two bounded policy values from environment configuration: reminder window minutes and escalation level. Defaults remain 60 minutes and level 1. Each sweep processes up to 50 candidates. Both reminder and overdue escalation transitions use Prisma transactions so claim-marker changes and matching outbox records are committed or rolled back together. Dedupe keys are based on the event type and source alert ID; inserts use conflict-safe idempotency.

## Files changed
- `backend/api/src/workers/document-scan-worker.ts`
- `backend/api/package.json`
- `scripts/verify-p446-alert-sla-automation.mjs` (updated expectation for configurable policy)
- `scripts/verify-p447-alert-sla-policy-atomicity.mjs`
- Root and `docs/phases/` release and project tracking documents

## Known limits
Environment policy is configurable, but there is no persisted per-school/per-severity policy CRUD UI. Live PostgreSQL validation and delivery tests remain outstanding. Notification events remain subject to the existing outbox delivery worker/provider configuration.
