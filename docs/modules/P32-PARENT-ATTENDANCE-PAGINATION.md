# P32 — Parent Attendance Pagination

## Delivered
- Parent attendance endpoint accepts `limit` (1–100, default 30), opaque `cursor`, and optional inclusive `from`/`to` calendar dates.
- Results are ordered deterministically by `markedAt DESC, id DESC`.
- Cursor is verified inside the same tenant, student, guardian-linked access scope and submitted/locked session/date filter before it is used.
- API returns `{ data, nextCursor, hasMore }`.
- Parent mobile app appends subsequent pages with a Load more control and clears pagination state when changing schools, children or signing out.
- The upper date bound uses the following UTC midnight as an exclusive bound, including all attendance on the requested `to` date.

## Security and limits
- Existing `parent.attendance.read`, active membership, PARENT role, accepted consent, verified guardian and communications-enabled student link checks remain mandatory on every request.
- Page size is capped at 100 to bound database and response work.
- A cursor belonging to another student, tenant, unpublished session or requested date range is rejected with HTTP 400.
- Attendance remains read-only; teacher remarks and private staff notes are not returned.

## Acceptance still required
- Run PostgreSQL-backed cursor boundary, duplicate timestamp, invalid/foreign cursor, consent withdrawal and cross-tenant tests.
- Verify pagination behavior while records are inserted/corrected between requests.
- Expo build and iOS/Android device acceptance remain pending.
