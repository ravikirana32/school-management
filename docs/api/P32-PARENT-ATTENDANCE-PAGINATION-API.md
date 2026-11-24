# P32 Parent Attendance Pagination API

`GET /api/v1/:organizationId/:schoolId/parents/portal/children/:studentId/attendance`

Query parameters:

| Parameter | Rules | Default |
|---|---|---|
| `limit` | Integer 1–100 | 30 |
| `cursor` | Opaque attendance row ID, max 128 chars | none |
| `from` | ISO date `YYYY-MM-DD`, inclusive | none |
| `to` | ISO date `YYYY-MM-DD`, inclusive | none |

`from` must not be later than `to`. The server validates the cursor against the same student, organization, school, guardian link, published attendance session and date range. It returns HTTP 400 for a cursor outside that scope.

Response:

```json
{
  "data": [{
    "id": "attendance-row-id",
    "sessionId": "session-id",
    "status": "PRESENT",
    "arrivalTime": null,
    "markedAt": "2026-11-17T00:00:00.000Z",
    "session": {
      "id": "session-id",
      "sessionDate": "2026-11-16T00:00:00.000Z",
      "gradeLevelId": "grade-id",
      "sectionName": "A",
      "status": "LOCKED"
    }
  }],
  "nextCursor": "attendance-row-id-or-null",
  "hasMore": false
}
```

Rows are ordered by `markedAt DESC, id DESC`. The next request repeats the same date filters and supplies `nextCursor`. A cursor is not a bearer credential and does not bypass any authorization checks.
