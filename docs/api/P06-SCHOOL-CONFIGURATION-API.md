# P06 School Configuration API

Base path `/api/v1/schools`. All endpoints require authentication and active school membership. Mutation endpoints require the school administrator role.

| Method | Path | Purpose |
|---|---|---|
| GET/PUT | `/:organizationId/:schoolId/profile` | Read/update school profile |
| GET/POST | `/:organizationId/:schoolId/academic-years` | List/create academic years |
| POST | `/:organizationId/:schoolId/academic-years/:academicYearId/terms` | Add term to year |
| GET/POST | `/:organizationId/:schoolId/calendars` | List/create calendars |
| GET/POST | `/:organizationId/:schoolId/calendars/:calendarId/events` | List/add calendar events |
| GET/PUT | `/:organizationId/:schoolId/working-days` | Read/update weekly working days |
| GET/PUT | `/:organizationId/:schoolId/policies` | Read/update attendance/grading policies |

Dates for academic years and terms use `YYYY-MM-DD`; event timestamps require ISO 8601 offsets. School timezone is a configuration value; conversion and DST-safe recurrence behavior must be handled by consuming modules.
