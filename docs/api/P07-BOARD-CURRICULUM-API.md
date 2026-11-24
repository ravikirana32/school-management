# P07 Board and Curriculum API

All endpoints are under `/api/v1/curriculum`. Except `GET /catalogue`, routes require an authenticated user with active membership in the requested school. Mutations require SCHOOL_ADMIN.

| Method | Path | Description |
|---|---|---|
| GET | `/catalogue` | Supported board-family catalogue |
| GET/PUT | `/:organizationId/:schoolId/board` | Read or configure the school's board profile |
| GET/POST | `/:organizationId/:schoolId/grades` | List/create grade levels |
| GET/POST | `/:organizationId/:schoolId/versions` | List/create curriculum versions |
| GET/POST | `/:organizationId/:schoolId/versions/:versionId/subjects` | List/add subject mappings |

Date-only fields use `YYYY-MM-DD`. Board profile, grade, version and subject payloads are validated with Zod. Curriculum writes are blocked when the active plan does not include `curriculumConfiguration`.
