# P46 API

All routes require authenticated active school membership and `school.settings.manage`.
- `GET /api/v1/:organizationId/:schoolId/notification-suppressions?status=ACTIVE|RELEASED` — returns up to 100 records without email addresses or hashes.
- `POST /api/v1/:organizationId/:schoolId/notification-suppressions` — body `{ email, reason, sourceEventId? }`. Returns ID/status only.
- `POST /api/v1/:organizationId/:schoolId/notification-suppressions/:suppressionId/release` — body `{ reason }`, minimum eight characters.
