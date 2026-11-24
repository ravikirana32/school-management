# P23 — Room Alias Registry & School Admin Authentication Integration

## Scope
P23 adds an explicit, school-scoped mapping workflow for historical timetable room labels and replaces the timetable editor's manually pasted bearer token with the platform's existing email/password login and rotating refresh-token endpoints.

## Room alias lifecycle
1. A School Admin creates an alias (`aliasLabel` → active `canonicalRoomCode`). The record starts as `PENDING`.
2. A School Admin explicitly approves the mapping. Approval records `approvedBy` and rechecks that the target room is active.
3. A separate apply action acquires the same school-wide PostgreSQL advisory lock used by room/timetable writes.
4. In one tenant-scoped database transaction, the API rewrites matching legacy slot and exception room labels using normalized `lower(btrim(...))` equality, then marks the alias `APPLIED` with `appliedAt`.
5. The existing P22 database triggers validate canonical active room references during the update. Any failure rolls back the whole transaction.

No fuzzy matching or automatic migration is performed. Reviewers must map labels deliberately. Alias records are retained as an audit trail; applied mappings are not silently deleted.

## API
All endpoints require a bearer access token, active school membership and School Admin role.

- `GET /api/v1/:organizationId/:schoolId/timetable/rooms/aliases`
- `POST /api/v1/:organizationId/:schoolId/timetable/rooms/aliases` — `{ aliasLabel, canonicalRoomCode }`, creates `PENDING` mapping.
- `POST /api/v1/:organizationId/:schoolId/timetable/rooms/aliases/:aliasId/approve`
- `POST /api/v1/:organizationId/:schoolId/timetable/rooms/aliases/:aliasId/apply`

Apply returns updated slot and exception counts. Missing aliases return 404; non-approved aliases and inactive target rooms return 409.

## School Admin authentication
The timetable workspace now signs in through `POST /api/v1/auth/login`, rotates sessions through `POST /api/v1/auth/refresh` after a 401, and revokes the refresh token through `POST /api/v1/auth/logout`. Password is cleared after sign-in. Access and refresh tokens remain in component memory only; reload requires signing in again. No browser storage is used.

Organization, school and academic-year identifiers remain explicit scope inputs in this phase. The workspace still requires a School Admin membership and role at every protected API endpoint; entering identifiers does not grant access.

## Limitations
- This phase integrates authentication inside the timetable workspace, not yet a universal authenticated shell for every School Admin tab.
- Organization/school membership discovery and academic-year pickers remain future work.
- Alias approval and application are separate user actions, but a second-person approval policy is not enforced.
- Database migrations and RLS behavior require runtime verification before production.
