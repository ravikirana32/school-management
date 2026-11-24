# P21 — Timetable CSV, Bell Templates & School Admin Editor

## Scope delivered

- Persisted School Admin timetable workspace backed by the timetable APIs.
- Assignment and active room pickers sourced from the selected school and academic year.
- Canonical room-code validation on new slot create/update, JSON bulk import, CSV import, template application and date-exception writes.
- RFC4180-style CSV parsing for quoted commas, escaped quotes and CRLF; exact header order; 1 MB and 500-row limits.
- CSV preview endpoint returns validation status and row-level errors. Import is transactional and all-or-nothing.
- CSV export is scoped to the authenticated school and returns at most 5,000 active rows.
- Reusable bell-schedule templates store period number, start/end and label; applying a template creates slots transactionally for selected assignments and weekdays, with advisory locking and conflict checks.
- Teacher mobile date navigation supports previous/next day and previous/next week.

## API

- `GET /api/v1/:organizationId/:schoolId/timetable/options?academicYearId=...`
- `GET /api/v1/:organizationId/:schoolId/timetable/templates`
- `POST /api/v1/:organizationId/:schoolId/timetable/templates`
- `POST /api/v1/:organizationId/:schoolId/timetable/templates/:templateId/apply`
- `POST /api/v1/:organizationId/:schoolId/timetable/slots/csv/preview` with `{ "csv": "..." }`
- `POST /api/v1/:organizationId/:schoolId/timetable/slots/csv/import` with `{ "csv": "..." }`
- `GET /api/v1/:organizationId/:schoolId/timetable/slots/csv/export?academicYearId=...`

CSV headers are exact and case-sensitive: `teacherAssignmentId,academicYearId,dayOfWeek,periodNumber,startsAt,endsAt,subjectName,room,effectiveFrom,effectiveTo`. Optional values may be empty. `room` must be an active room code when supplied.

## Room migration policy

Existing timetable slot room strings are not mass-converted. They may be informal labels, room names or stale values. New writes accept only an active `SchoolRoom.code`; legacy values remain readable until an administrator maps them to a room catalogue entry. A future migration should stage candidate mappings and produce an exception report before any rewrite.

## Limitations

- CSV import is synchronous and capped at 500 rows; a queued import/progress model is still required for large datasets.
- CSV preview validates syntax and schema; database assignment, room and conflict checks are authoritative during import.
- Bell templates describe period times/labels. Subject/teacher assignment remains selected when applying.
- The editor uses an authenticated API token supplied in the workspace and does not yet integrate the School Admin app's global auth/session context.
- API advisory locks do not protect direct SQL writes.
