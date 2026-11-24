# P163 — Operations Alert Console

## Delivered
- Added tenant identifiers and acknowledgement metadata to `OperationsAlertOutbox` with indexed history lookups.
- Added tenant-scoped alert history, acknowledgement and retry endpoints under `/operations/alerts`.
- All reads and mutations require active school membership and `accounting.reconcile`; mutations write audit records.
- Added School Admin Finance alert history, status filtering, acknowledgement and retry controls.
- Added 90-day retention pruning for successfully delivered, acknowledged alerts in the document worker.

## Isolation and behavior
- Existing platform-wide alerts have NULL tenant identifiers and are intentionally excluded from school-level history to prevent cross-tenant disclosure.
- Only alert producers that explicitly populate matching `organizationId` and `schoolId` appear in this console. The P162 document worker currently emits platform-level worker health events, so those events remain outside this tenant console until a separately authorized platform-operations surface is provided.
- Retry is limited to rows already in `RETRY`; acknowledgement is idempotent and tenant constrained.
- Retention deletes only `DELIVERED` alerts that have been acknowledged and are older than 90 days. Pending, retrying, sending and unacknowledged records are retained.

## Deployment
Apply migration `20261118260000_p163_operations_alert_console`. Build API and School Admin, then verify the endpoints using two distinct school tenants and confirm neither can read or mutate the other's alerts. Verify worker retention against a disposable old acknowledged/delivered row.

## Verification limitations
Source-level checks and archive integrity are performed for this phase. Database migration, API/UI builds, live webhook delivery and multi-tenant runtime acceptance require the deployment environment and are not claimed here.
