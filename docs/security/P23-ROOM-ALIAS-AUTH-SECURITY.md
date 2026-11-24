# P23 Security Notes

- Alias rows carry organization and school IDs and use forced PostgreSQL RLS with transaction-local tenant context.
- API operations require active school membership and School Admin role.
- Alias targets are checked against active canonical rooms in the same tenant.
- Alias application is explicit, transaction-scoped and serialized with room/timetable writes.
- SQL update predicates include organization ID, school ID and normalized source label; parameters are bound, not interpolated into SQL.
- P22 triggers independently reject room references to inactive or missing canonical rooms.
- Access/refresh tokens are memory-only in the timetable workspace. Password input is cleared after successful login. No token is written to browser storage or logs.
- A failed refresh is surfaced to the user; the editor does not silently retry with stale credentials.

## Remaining security work
Run migrations under the production application database role, test forced RLS and trigger behavior, test refresh-token reuse/race behavior, and add authenticated browser E2E. A second-person approval policy and universal authenticated app shell are not part of P23.
