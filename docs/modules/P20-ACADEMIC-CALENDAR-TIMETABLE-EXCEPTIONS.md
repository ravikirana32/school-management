# P20 — Academic Calendar & Timetable Exceptions

## Delivered source

- `SchoolRoom` provides a school-scoped room catalogue with canonical room code, name, type, capacity and floor. Room codes are unique within a school; records are deactivated rather than deleted.
- `TeacherTimetableException` represents a date-specific cancellation, substitute assignment or one-day time/room override. The recurring `TeacherTimetableSlot` is not mutated.
- A unique slot/date constraint prevents duplicate active or inactive exception rows for the same occurrence; the API reactivates/updates an existing row.
- Teacher daily timetable projection applies exceptions, hides cancelled periods, moves substitute periods to the substitute teacher's view, and suppresses regular periods on non-instructional holiday/closure events.
- Timetable create/update/bulk operations and exception writes acquire transaction-scoped PostgreSQL advisory locks per organization/school/academic-year before preflight conflict detection.

## Endpoints

| Method | Path | Access |
|---|---|---|
| GET | `/:organizationId/:schoolId/timetable/rooms` | School Admin |
| POST | `/:organizationId/:schoolId/timetable/rooms` | School Admin |
| DELETE | `/:organizationId/:schoolId/timetable/rooms/:roomId` | School Admin |
| GET | `/:organizationId/:schoolId/timetable/exceptions?date=YYYY-MM-DD` | School Admin |
| POST | `/:organizationId/:schoolId/timetable/exceptions` | School Admin |
| DELETE | `/:organizationId/:schoolId/timetable/exceptions/:exceptionId` | School Admin |
| GET | `/:organizationId/:schoolId/teacher/me/timetable?date=YYYY-MM-DD` | Active teacher membership |

### Exception request

`exceptionType` is `CANCEL`, `SUBSTITUTE` or `OVERRIDE`. Substitute requires an active assignment in the same school and academic year. Override start/end times must be supplied together. Every exception requires a date and reason. Writes are tenant-scoped and checked against timetable conflicts.

## Important boundaries

- Room catalogue is available, but existing timetable `room` remains a text field for backward compatibility; strict room-code enforcement and migration of historical room labels remain open.
- Advisory locks serialize mutations that use these timetable API paths. Direct database writes that bypass the API do not participate in that lock protocol.
- Holiday integration currently suppresses regular slots for `HOLIDAY`/`CLOSURE` calendar events unless marked as an instructional day. Event audience and school-local date/time policy still need full acceptance testing.
- CSV import/export, timetable editor, recurring exception series and mobile week navigation are not included.
