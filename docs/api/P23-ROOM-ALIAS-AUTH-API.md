# P23 Room Alias & Authentication API

## Room alias endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/:organizationId/:schoolId/timetable/rooms/aliases` | List school-scoped alias records |
| POST | `/:organizationId/:schoolId/timetable/rooms/aliases` | Create a pending alias |
| POST | `/:organizationId/:schoolId/timetable/rooms/aliases/:aliasId/approve` | Revalidate target room and approve |
| POST | `/:organizationId/:schoolId/timetable/rooms/aliases/:aliasId/apply` | Transactionally migrate matching slot and exception labels |

All paths are mounted under `/api/v1`, require authentication, active school membership and School Admin authorization. The target room must be active in the same school. Alias uniqueness is based on normalized lower-case, trimmed labels per school.

### Safety contract
- Creation never mutates timetable data.
- Approval never mutates timetable data.
- Apply requires `APPROVED` status.
- Apply acquires the school-wide advisory transaction lock.
- Slot and exception updates execute in the same tenant transaction.
- P22 room triggers reject inactive/missing canonical rooms.
- Alias status becomes `APPLIED` only in the same transaction as the data migration.

## Authentication endpoints used by the editor
- `POST /api/v1/auth/login` with `{ email, password }`.
- `POST /api/v1/auth/refresh` with `{ refreshToken }`.
- `POST /api/v1/auth/logout` with `{ refreshToken }`.

The editor retains tokens only in memory. It does not persist passwords or tokens in local/session storage.
