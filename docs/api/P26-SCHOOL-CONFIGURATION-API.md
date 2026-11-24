# P26 — School Configuration API Usage

The School Admin client now consumes these existing authenticated endpoints:

| Method | Endpoint | Workspace |
|---|---|---|
| GET / PUT | `/:organizationId/:schoolId/profile` | School profile |
| GET / POST | `/:organizationId/:schoolId/academic-years` | Academic years |
| GET / POST | `/:organizationId/:schoolId/calendars` | Calendars |
| GET / POST | `/:organizationId/:schoolId/calendars/:calendarId/events` | Calendar events |
| GET / PUT | `/:organizationId/:schoolId/working-days` | Working days |
| GET / PUT | `/:organizationId/:schoolId/policies` | School policies |

The API router already authenticates requests, checks active school membership and applies tenant context to database access. Mutation endpoints require school administrator access; academic-year creation also checks the academic configuration subscription entitlement. The frontend does not bypass these checks.

## Client behavior

- Uses the shared session request helper with bearer token and one refresh retry.
- Loads data on tab entry and provides a manual reload action.
- Sends only schema-supported fields.
- Displays API errors without claiming local-only changes were persisted.

## Permission requirements

- School profile, working days and policies: `school.settings.manage`.
- Academic years, terms, calendars and calendar events: `academics.manage`.
- Read endpoints require an active school membership; mutation endpoints also enforce the corresponding permission.
- Academic-year creation additionally checks the active subscription entitlement.
