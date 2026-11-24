# P24 — School Admin Authenticated Tenant Workspace

## Scope

P24 replaces manual School Admin API tokens and tenant IDs in the attendance and timetable workspaces with a shared in-memory authenticated session and membership-driven tenant selection.

## Delivered source

- `GET /api/v1/organizations/me/schools` returns only active `SchoolMembership` records for the authenticated user. It resolves organization and school display metadata inside tenant context and does not accept caller-supplied tenant identifiers.
- School Admin shell has one login, refresh and logout session state.
- Organization/school selection is built from the authenticated membership response.
- Academic-year choices load from the selected school through the existing academic-year API; the current year is preferred by default.
- Attendance and timetable workspaces consume the shared access token and API request function.
- Access and refresh tokens are held in React memory only; reload requires sign-in. Password is cleared after login.
- 401 responses trigger single-flight refresh-token rotation and one retry.

## Alias migration controls

- Added a non-mutating alias preview endpoint returning exact slot/exception impact counts, active-reference counts and target-room validity.
- Alias approval now requires a different School Admin from the alias creator (maker-checker).
- Create, approve and apply operations append actor-attributed `AuditLog` events in the same transaction as the alias state change.
- UI exposes dry-run preview and requires a successful preview before enabling Apply.

## Endpoints

- `GET /api/v1/organizations/me/schools`
- `GET /api/v1/schools/:organizationId/:schoolId/academic-years` (existing endpoint reused)
- `GET /api/v1/:organizationId/:schoolId/timetable/rooms/aliases/:aliasId/preview`
- Existing alias create/approve/apply endpoints now enforce maker-checker and append audit events.

## Security notes

- Tenant IDs in the school-admin shell are no longer manually entered; the selected pair originates from active membership data.
- Server-side membership and school-admin checks remain authoritative for every protected API.
- Client-side membership discovery is not an authorization boundary.
- Tokens are not written to localStorage, sessionStorage, IndexedDB or cookies.
- Alias preview is read-only; apply remains a transaction protected by the existing school advisory lock.
- Alias approval rejects self-approval. This is a fixed dual-control rule, not a configurable policy engine.

## Remaining limitations

- Other School Admin tabs outside attendance/timetable still include local preview workflows and do not all consume the shared authenticated request context.
- Academic-year and membership APIs have not been tested against PostgreSQL RLS in this environment.
- No browser E2E or API integration suite was executed.
- Audit immutability is logical append-only behavior by convention; DB-level UPDATE/DELETE prevention for audit rows remains open.
- The preview and apply operations can observe different source counts if records change between them; apply recomputes the actual update count transactionally.
