# P42 — Parent notification inbox lifecycle

## Scope delivered

- Replaced the fixed 100-row parent notification response with bounded keyset pagination (`limit` 1–100, default 30).
- Cursor carries a version, last `(createdAt,id)` anchor and first-page watermark. Continuation queries retain the original watermark, so notifications inserted after page one do not shift the active traversal.
- Cursor anchors are revalidated against the authenticated recipient, tenant, school and current consented guardian/student scope. Invalid, malformed, stale or foreign-scope cursors return HTTP 400 without disclosing record details.
- Parent inbox response includes current unread count and `nextCursor`/`hasMore`.
- Added mark-all-read endpoint and parent mobile Load more, unread count and Mark all read controls.
- School switching clears old inbox state before loading the next school.
- Added a descending recipient/school index aligned with `(createdAt DESC,id DESC)` pagination.

## API

`GET /api/v1/parents/:organizationId/:schoolId/portal/notifications?limit=30&cursor=<opaque>`

Returns `{ data, nextCursor, hasMore, unreadCount }`. The first page establishes a watermark; subsequent pages must use the returned cursor.

`GET /api/v1/parents/:organizationId/:schoolId/portal/notifications/unread-count`

Returns the current consent-scoped unread count.

`POST /api/v1/parents/:organizationId/:schoolId/portal/notifications/read-all`

Marks only the authenticated recipient's notifications visible through currently accepted consent and active communication links as read. Returns the number changed.

`POST /api/v1/parents/:organizationId/:schoolId/portal/notifications/:notificationId/read`

Retains existing per-notification read behavior and same recipient/consent scoping.

## Snapshot and retention semantics

The pagination watermark is a traversal boundary, not a historical database snapshot. Concurrent inserts newer than the watermark are intentionally excluded until the parent refreshes the inbox. Concurrent read-state changes do not change page membership. Deleted records can invalidate an anchor; the client should refresh when it receives a cursor error. No automatic notification deletion/retention job is introduced in P42: retention duration, legal holds and school-level policy need a product/legal decision before destructive cleanup is automated.

## Security

- Every request requires authenticated parent portal access and current accepted, non-withdrawn consent.
- Student-specific notices are limited to students currently linked with `canReceiveCommunications`.
- Every list, unread and read mutation includes organization, school and recipient predicates under tenant context.
- Cursor values are never treated as authorization; the anchor and result set are independently re-scoped on every request.
- Response does not expose recipient account identifiers or email addresses.
