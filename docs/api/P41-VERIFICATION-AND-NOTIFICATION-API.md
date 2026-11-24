# P41 API — verification and notification delivery

## Public report-card verification

`GET /api/v1/public/report-cards/verify/:code`

- No bearer token is required.
- `code` must be exactly 32 uppercase hexadecimal characters (128 random bits).
- Valid response contains `valid`, `schoolName`, `academicYear`, `term`, `issuedAt` and a privacy statement.
- Does not return student name, admission number, marks, report-card ID, object key or signed URL.
- Returns 404 for malformed, unknown, unpublished or unavailable records; 429 after the process-local rate threshold.

## Notification worker

No new public enqueue endpoint is exposed. Publication writes `NotificationOutbox` records transactionally. The worker polls/reconciles `EMAIL` rows in `PENDING`/`RETRY` and stale `PROCESSING` states.

- Rechecks current `NotificationPreference` at delivery time.
- Rechecks active Guardian, verified email, student link with `canReceiveCommunications=true`, and accepted/non-withdrawn ParentInvitation consent.
- Uses HTTPS provider POST and outbox ID as idempotency key.
- State transitions: `PENDING -> PROCESSING -> DELIVERED`, or `RETRY -> DEAD_LETTER`; ineligible records become `CANCELLED`.
- IN_APP inbox records are written as delivered in the publication transaction. EMAIL records are durable asynchronous work. PUSH is not dispatched.
