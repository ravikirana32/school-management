# P04 Organization API

All endpoints require a P02 bearer session. Organization-specific operations require active membership; mutations require an active organization owner/admin assignment.

| Method | Path | Purpose |
|---|---|---|
| POST | `/onboard` | Create organization, first school and owner memberships |
| GET | `/` | List organizations the current user belongs to |
| GET | `/:organizationId/schools` | List active schools in an organization |
| POST | `/:organizationId/schools` | Create school (organization admin) |
| POST | `/:organizationId/invitations` | Create role-scoped invitation (delivery pending) |
| POST | `/invitations/accept` | Accept invitation after secure delivery is integrated |
| PATCH | `/:organizationId/schools/:schoolId/status` | Change school lifecycle status with reason |

Do not expose invitation tokens in logs or responses. Current invitation creation is persisted but intentionally reports `PENDING_DELIVERY` until an email adapter is configured.
