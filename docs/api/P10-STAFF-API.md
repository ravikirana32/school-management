# P10 Staff API

Base path: `/api/v1/:organizationId/:schoolId/staff`. All routes authenticate and require active School Admin membership.

| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/departments` | List/create departments |
| GET/POST | `/designations` | List/create designations |
| GET | `/members` | Search/paginated staff directory |
| POST | `/members` | Create staff and initial employment history |
| GET | `/members/:staffId` | Staff detail |
| PATCH | `/members/:staffId/status` | Change lifecycle status and record audit event |
| GET/POST | `/teacher-assignments` | List/create teacher assignments |
| POST | `/members/:staffId/documents` | Register staff document metadata |

The current endpoints are School Admin-only. OpenAPI generation, granular authorization, binary file upload, document review and richer employment history endpoints remain pending.
