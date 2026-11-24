# P200 — Admissions Notification Delivery Reliability

## Implemented source remediation
- Added `worker:admissions-notification-reconciliation` for periodic recovery of missed admissions submission notifications.
- Worker discovers recently submitted applications (30-day lookback, 100 per sweep) and re-resolves active same-school staff with `admissions.manage`.
- Uses active school memberships and active users only.
- Creates deterministic notification batch IDs and deterministic recipient outbox IDs; uses upsert/createMany skipDuplicates for idempotent recovery.
- Repaired notifications remain in-app, recipient-scoped, and contain application number plus first name only; no guardian contacts, tracking token, document data, or internal review notes.
- Worker starts with a recovery sweep and repeats at `ADMISSIONS_NOTIFICATION_RECONCILIATION_INTERVAL_MS` (default 60 seconds); graceful shutdown included.
- Added package script `worker:admissions-notification-reconciliation`.

## Deployment
Run alongside the API as a dedicated process: `npm run worker:admissions-notification-reconciliation`. Configure the optional interval environment variable. This worker requires database access to the cross-tenant candidate query and tenant-scoped reconciliation writes; review deployment DB privileges/RLS before enabling.

## Remaining gaps
- Does not dispatch admissions email/SMS; provider dispatch and provider delivery receipts remain open.
- Preference/consent enforcement for non-IN_APP channels remains open pending channel producer integration.
- Retry/dead-letter UI, mobile inbox, pagination, bulk read, and application deep links remain open.
- Redis-distributed rate limiting, CAPTCHA and guardian contact verification remain open.
- Build/typecheck/API/security/runtime acceptance is deferred per project instruction.
