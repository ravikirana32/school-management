# P103 — Mobile Offline and Sync API

## Attendance mark idempotency
`POST /api/v1/:organizationId/:schoolId/attendance/sessions/:sessionId/marks`

- Send an `Idempotency-Key` header (8–128 characters from `[A-Za-z0-9._:-]`).
- Server computes SHA-256 over the session ID and validated mark payload.
- Successful marks and the replay receipt are committed in one tenant transaction.
- A repeated key with the same payload returns the stored response and `replayed: true`.
- A repeated key with a different payload returns HTTP 409.
- A domain conflict (session no longer OPEN, marks already exist, or student/enrollment invalid) returns an appropriate error and is never silently overwritten.

## Incremental attendance change feed
`GET /api/v1/:organizationId/:schoolId/attendance/mobile-sync?cursor=<opaque>&limit=50`

- Requires active school membership and attendance entitlement/permission.
- Cursor is an opaque base64url keyset over `createdAt` and audit event ID.
- Page size is clamped to 1–100.
- Response includes authorized `changes`, `hasMore`, `nextCursor`, `serverTime` and tenant scope.
- Only events whose linked attendance session is accessible to the current teacher/admin are returned.
- Persist `nextCursor` only after successfully processing the page. Continue while `hasMore` is true.

## Client queue policy
The teacher app queues only attendance mark batches. Each batch carries a stable idempotency key. 409 is surfaced as CONFLICT; 4xx non-retryable errors and exhausted retries become FAILED; network/5xx/408/429 use exponential backoff.
