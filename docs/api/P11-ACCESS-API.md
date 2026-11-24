# P11 Access API

Base path: `/api/v1/:organizationId/:schoolId/access`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/permissions` | School Admin | Permission catalog |
| GET/POST | `/roles` | School Admin | List roles / create school-scoped role |
| POST | `/assignments` | School Admin | Assign role to active school member |
| DELETE | `/assignments/:assignmentId` | School Admin | Revoke assignment |
| GET | `/members/:userId/permissions` | School Admin | Inspect member's roles and permissions |
| GET | `/me/permissions` | Active school member | Read own roles and permissions |
| POST | `/staff/:staffId/link-account` | School Admin | Link to an existing verified account |

Teacher self-service endpoint: `GET /api/v1/:organizationId/:schoolId/staff/my-teaching-assignments`. It returns only assignments for the caller's linked active staff profile. API contracts still need OpenAPI registration and runtime verification.
