# P143 — Parent Refund Status Publication API

## School Admin endpoints
- `GET /api/v1/:organizationId/:schoolId/parents/fees/refunds` — requires `fees.refunds.approve`; returns the latest 100 refund records and their current parent-publication state.
- `POST /api/v1/:organizationId/:schoolId/parents/fees/refunds/:refundId/parent-visibility` — requires `fees.refunds.approve`; body `{ "visible": true | false }`. The action is persisted and appended to refund event history and audit log.

## Parent endpoint
- `GET /api/v1/:organizationId/:schoolId/parents/portal/children/:studentId/refunds` — requires active parent consent, `parent.fees.read`, and a verified guardian/student communication link. Only records with `parentVisibleAt` set are returned.

## Parent-safe response
Returns refund ID, amount, currency, reason, status, created/approved/settled timestamps, payment receipt reference, fee title and lifecycle event type/status/timestamp. Staff identities, internal event notes and private settlement metadata are omitted.

## Persistence
`StudentFeeRefund.parentVisibleAt` and `parentVisibleBy` record the current publication state. The additive migration creates a composite tenant/student/publication index. Publication changes append `PARENT_VISIBILITY_PUBLISHED` or `PARENT_VISIBILITY_REVOKED` events and write an audit log record.

## Mobile integration
Parent Mobile fetches the endpoint for the selected child, caches the response using the existing encrypted SecureStore cache, and displays the published timeline read-only. Cached records remain read-only offline and are cleared with parent session/cache lifecycle operations.

## Acceptance boundary
Static source checks only. PostgreSQL migration, generated Prisma client, API runtime authorization, web and native-device behavior require local runtime validation.
