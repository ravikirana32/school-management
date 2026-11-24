# P452 Delivery Report

Implemented enhancements for the existing school IN_APP communications inbox:
- `GET /communications/inbox` supports validated cursor pagination, unread filtering, unread counts, and optional category grouping.
- `GET /communications/inbox/unread-count` provides a compact unread-count query.
- Cursor ordering uses `createdAt` descending and `id` descending for deterministic page boundaries.
- Returned row fields are explicitly selected to reduce accidental data exposure.
- New pagination/grouping helpers and focused tests added.
- API package script `verify:p452` added.

No Prisma schema or migration change was needed; P452 reuses existing NotificationOutbox records.
