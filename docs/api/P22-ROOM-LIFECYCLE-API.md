# P22 room lifecycle APIs

All endpoints require authentication, active school membership and School Admin access.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/:organizationId/:schoolId/timetable/rooms?includeInactive=true` | List all rooms when flag is true; otherwise active rooms only |
| PATCH | `/:organizationId/:schoolId/timetable/rooms/:roomId` | Edit metadata or reactivate/deactivate; code cannot be changed |
| GET | `/:organizationId/:schoolId/timetable/rooms/legacy-usage` | Non-destructive legacy room label report |
| DELETE | `/:organizationId/:schoolId/timetable/rooms/:roomId` | Soft-deactivate if no active slot/exception references exist |

Deactivation returns HTTP 409 if an active timetable slot or exception references the canonical room code. The P22 PostgreSQL trigger enforces the same invariant for direct SQL updates under tenant RLS context. The legacy report returns label reference counts, exact canonical matches, and labels requiring review. It never updates timetable rows.
