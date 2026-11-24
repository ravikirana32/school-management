# P12 Attendance API

All endpoints are under `/api/v1/:organizationId/:schoolId/attendance` and require a bearer-authenticated active school member.

| Method | Path | Purpose |
|---|---|---|
| POST | `/sessions` | Create a class/date session |
| GET | `/sessions?date=&gradeLevelId=` | List recent sessions |
| POST | `/sessions/:sessionId/open` | Open a draft session |
| POST | `/sessions/:sessionId/marks` | Bulk mark enrolled students |
| POST | `/sessions/:sessionId/submit` | Submit open session |
| POST | `/sessions/:sessionId/lock` | Lock submitted session (admin) |
| GET | `/students/:studentId/records` | Read up to 365 attendance records |
| POST | `/:attendanceId/correction-requests` | Request a correction |
| GET | `/correction-requests?status=PENDING` | Admin review queue |
| POST | `/correction-requests/:requestId/review` | Approve/reject correction |

Bulk marks body: `{ "marks": [{ "studentId": "...", "status": "PRESENT|ABSENT|LATE|HALF_DAY|EXCUSED|LEAVE", "arrivalTime": "ISO-8601", "remarks": "optional" }] }`.

The route validates the date format, class assignment, active enrollment, matching academic year/grade/section, duplicate student IDs, and session state. All writes run within a tenant-scoped transaction.
