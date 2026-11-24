# P28 — Operational Workflows API Changes

All endpoints are under `/api/v1/:organizationId/:schoolId` unless stated otherwise and require an authenticated active school membership.

## Authorization matrix

| Module / operation | Required permission |
|---|---|
| Curriculum reads | `academics.read` |
| Curriculum mutations and version status | `academics.manage` |
| Student list/detail | `students.read` |
| Student admission | `students.create` |
| Enrollment, pickup contact and document metadata | `students.update` |
| Guardian/pickup/document details | additionally `students.pii.read` |
| Staff list/detail | `staff.read` |
| Staff create, department and designation creation | `staff.create` |
| Staff status and document metadata | `staff.update` |
| Teacher assignment | `staff.assign` |
| Staff PII fields | additionally `staff.pii.read` |
| Role catalogue/create | `access.roles.manage` |
| Member/assignment/audit listing, assignment and revocation | `access.assignments.manage` |

## Added endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| PATCH | `/curriculum/versions/:versionId/status` | Set DRAFT, ACTIVE or RETIRED; activation retires other active versions for same school/year in the transaction |
| GET | `/access/members?search=` | Active school members for assignment pickers; max 100 results |
| GET | `/access/assignments` | Current school-scoped role assignments with member summary; max 500 |
| GET | `/access/audit` | Latest 100 access-related audit events |

## Existing endpoints now used by UI

- `POST /students/:studentId/enrollments`
- `POST /students/:studentId/pickup-contacts`
- `POST /staff/departments`
- `POST /staff/designations`
- `PATCH /staff/members/:staffId/status`
- `POST /curriculum/versions/:versionId/subjects`
- `DELETE /access/assignments/:assignmentId`

## Audit events

Access role creation, role assignment and assignment revocation create `AuditLog` rows transactionally. Sensitive student and staff detail/list reads create PII access events when the caller has the relevant PII permission.
