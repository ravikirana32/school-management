# P25 — School Admin permissions and timetable authorization

## Permission discovery

`GET /api/v1/:organizationId/:schoolId/access/me/permissions` returns the current membership's role keys and effective permission keys. The School Admin session refreshes this information after school selection changes. Client navigation is a usability guard only; backend authorization remains authoritative.

## Permission map

| Workspace | Required permission | Persistence |
|---|---|---|
| School profile | `school.settings.manage` | Preview only |
| Academic year | `academics.manage` | Preview only |
| Calendar | `academics.manage` | Preview only |
| Working days | `school.settings.manage` | Preview only |
| Policies | `school.settings.manage` | Preview only |
| Curriculum | `academics.read` | Preview only |
| Students | `students.read` | Preview only |
| Staff | `staff.read` | Preview only |
| Access | `access.roles.manage` | Preview only |
| Attendance | `attendance.manage` | API-backed |
| Timetable | `academics.manage` | API-backed |

## Timetable API authorization

Management routes accept either the SCHOOL_ADMIN role or an active school membership with `academics.manage`. All requests still require authentication and active membership. The teacher self-service timetable route remains self-scoped and is not widened by this change.

## School Admin role bootstrap

The seed idempotently links all seeded permission rows to SCHOOL_ADMIN. Organization onboarding also links all currently available permission rows to the SCHOOL_ADMIN role. A seed run after migration is required to populate the catalogue in a fresh environment.
