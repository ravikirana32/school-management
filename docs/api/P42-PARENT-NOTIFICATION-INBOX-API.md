# P42 Parent notification inbox API

See `docs/modules/P42-PARENT-NOTIFICATION-INBOX.md` for the complete API contract.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/parents/:organizationId/:schoolId/portal/notifications` | Bounded snapshot-watermarked keyset page and unread count |
| GET | `/api/v1/parents/:organizationId/:schoolId/portal/notifications/unread-count` | Consent-scoped unread count |
| POST | `/api/v1/parents/:organizationId/:schoolId/portal/notifications/read-all` | Mark all currently visible recipient notices as read |
| POST | `/api/v1/parents/:organizationId/:schoolId/portal/notifications/:notificationId/read` | Mark one visible notice as read |

Malformed or stale cursors return 400. An individual read request for an inaccessible/already-read notification returns 404. Page size defaults to 30 and is clamped to a safe default if outside 1–100.
