# P21 Timetable CSV & Template API

All endpoints require authentication, active school membership and School Admin access. Every database operation runs in organization/school tenant context.

| Method | Path | Purpose |
|---|---|---|
| GET | `/:org/:school/timetable/options?academicYearId=` | Active assignments and active rooms for pickers |
| GET | `/:org/:school/timetable/templates` | List active bell templates |
| POST | `/:org/:school/timetable/templates` | Create validated period template |
| POST | `/:org/:school/timetable/templates/:id/apply` | Transactionally apply template to assignments/days |
| POST | `/:org/:school/timetable/slots/csv/preview` | Strict parse and schema validation with row numbers |
| POST | `/:org/:school/timetable/slots/csv/import` | Validate assignments, rooms and conflicts; all-or-nothing insert |
| GET | `/:org/:school/timetable/slots/csv/export` | Download school-scoped CSV |

CSV preview/import request body is JSON `{ "csv": "header\n..." }`. Exact ordered headers: `teacherAssignmentId,academicYearId,dayOfWeek,periodNumber,startsAt,endsAt,subjectName,room,effectiveFrom,effectiveTo`. Maximum input 1 MB and 500 data rows. Import requires all rows to use one academic year.

Template periods contain `periodNumber`, `startsAt`, `endsAt`, and `label`. Applying requires `academicYearId`, `teacherAssignmentIds`, `days`, and optional room/effective date range. The label is copied to the timetable slot subject display field. Maximum generated slots per application: 500.
