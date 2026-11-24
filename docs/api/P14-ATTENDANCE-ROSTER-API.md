# P14 Attendance Roster API

`GET /api/v1/:organizationId/:schoolId/attendance/sessions/:sessionId/roster`

Requires authentication, active school membership, active attendance entitlement and School Admin attendance management access. Returns session details and up to 500 active students with active enrollment matching the session academic year, grade and section, plus existing attendance marks. It does not return guardian or other sensitive student data.

The route uses tenant-scoped queries and only returns records belonging to the selected session scope.
