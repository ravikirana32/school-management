# P34 — School Admin Parent Operations API

All endpoints require bearer authentication, active school membership and the named permission. Tenant context is set by the backend; clients must not treat organization/school IDs as authorization proof.

Base path: `/api/v1/:organizationId/:schoolId/parents`

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/fees?studentId=` | `fees.read` | List fee charges and recent payment rows, maximum 100 |
| POST | `/children/:studentId/fees` | `fees.manage` | Create fee charge, optionally publish |
| POST | `/fees/:chargeId/payments` | `fees.manage` | Manually reconcile a payment; no gateway call |
| PATCH | `/fees/:chargeId/publish` | `fees.manage` | Publish a DRAFT fee charge |
| GET | `/homework?studentId=` | `academics.manage` | List assignments, maximum 100 |
| POST | `/children/:studentId/homework` | `academics.manage` | Create assignment, optionally publish |
| PATCH | `/homework/:assignmentId/publish` | `academics.manage` | Publish a DRAFT assignment |
| GET | `/report-cards?studentId=` | `reports.manage` | List report cards, maximum 100 |
| POST | `/children/:studentId/report-cards` | `reports.manage` | Create report card, optionally publish |
| PATCH | `/report-cards/:reportCardId/publish` | `reports.manage` | Publish a DRAFT report card |
| GET | `/notifications` | `parent.notifications.manage` | List latest 100 school notifications |
| POST | `/children/:studentId/notifications` | `parent.notifications.manage` | Create in-app notification for eligible parent recipients |

Publish operations return 404 for a record outside the tenant/school and 409 when the record is not in DRAFT state. The notification create endpoint returns recipient count, not recipient addresses. The existing parent-facing endpoints continue to enforce guardian identity, active membership, accepted consent and linked-student checks.

## Pagination
The new operator list endpoints currently cap at 100 and do not yet expose a cursor. Do not use them as an unbounded export interface.

Notification list responses intentionally omit recipient user IDs. They are per-recipient records but the School Admin workspace does not expose account identifiers.

Report-card `resultSummary` must be a non-empty object with at most 100 top-level keys; this is a generic structural bound, not board-specific marks/grade validation.
