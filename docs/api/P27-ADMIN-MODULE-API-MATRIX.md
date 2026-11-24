# P27 — Admin Module API Matrix

All routes are called with the active bearer token and organization/school context from the School Admin session.

| Module | Method | Route | UI behavior |
|---|---|---|---|
| Curriculum | GET | `/api/v1/curriculum/catalogue` | Load board catalogue |
| Curriculum | GET/PUT | `/api/v1/curriculum/:org/:school/board` | Read/save board profile |
| Curriculum | GET/POST | `/api/v1/curriculum/:org/:school/grades` | List/create grades |
| Curriculum | GET/POST | `/api/v1/curriculum/:org/:school/versions` | List/create versions |
| Students | GET/POST | `/:org/:school/students` | Search/list and create student |
| Staff | GET/POST | `/:org/:school/staff/members` | Search/list and create staff |
| Staff | GET | `/:org/:school/staff/departments` | Load departments |
| Staff | GET | `/:org/:school/staff/designations` | Load designations |
| Staff | GET/POST | `/:org/:school/staff/teacher-assignments` | List/create teacher assignment |
| Access | GET | `/:org/:school/access/roles` | Load roles and permissions |
| Access | GET | `/:org/:school/access/permissions` | Load permission catalogue |
| Access | POST | `/:org/:school/access/roles` | Create custom role |
| Access | POST | `/:org/:school/access/assignments` | Assign role to existing member |

The API router is versioned under `/api/v1`; organization and school IDs are URI-encoded by the client. Student/staff/access routes enforce the server-side scope rules documented in the module and security notes. API errors are surfaced in the workspace status area; the UI does not silently convert failures into local preview records.
