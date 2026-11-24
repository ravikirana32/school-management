# P35 API — School Admin operational list pagination

Base path: `/api/v1/:organizationId/:schoolId/parents`

| Method | Endpoint | Permission | Filters |
|---|---|---|---|
| GET | `/fees` | `fees.read` | `studentId`, `limit`, `cursor` |
| GET | `/homework` | `academics.manage` | `studentId`, `limit`, `cursor` |
| GET | `/report-cards` | `reports.manage` | `studentId`, `limit`, `cursor` |
| GET | `/notifications` | `parent.notifications.manage` | `limit`, `cursor` |

## Request

`GET /fees?studentId=stu_123&limit=30`

`GET /fees?studentId=stu_123&limit=30&cursor=eyJ2IjoxLCJpZCI6ImNoYXJnZV8xIn0`

## Response

```json
{
  "data": {
    "items": [],
    "nextCursor": null,
    "hasMore": false
  }
}
```

The notification response also includes `recipientIdentityIncluded: false`. It does not return recipient account IDs or direct contact information.

## Validation and errors

- `limit` defaults to 30 and must be between 1 and 100.
- Invalid cursor encoding/version/shape returns HTTP 400.
- Cursor anchor must exist in the same tenant, school and student filter; otherwise HTTP 400.
- Missing membership/permission is rejected by existing route guards.
- Data queries always include organization and school predicates and execute inside tenant context.

Ordering: `createdAt DESC, id DESC`. Cursor anchors use Prisma unique-ID cursor with `skip: 1` after same-scope validation.
