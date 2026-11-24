# P15 Teacher Attendance API

`GET /api/v1/:organizationId/:schoolId/attendance/teacher/sessions/:sessionId/roster`

Requires active school membership, active attendance entitlement, `attendance.mark`, an active linked staff profile and a current assignment matching academic year, grade, section and effective date. Returns up to 500 active enrolled students with minimal identity fields and existing marks.

`GET /api/v1/:organizationId/:schoolId/attendance/sessions?date=YYYY-MM-DD` now restricts non-admin users with `attendance.mark` to sessions matching their active teacher assignments. Administrators retain school-scoped listing.

`POST .../attendance/sessions`, `/open`, `/marks` and `/submit` validate the matching academic-year assignment and effective dates for teachers. Lock remains administrator-only.
