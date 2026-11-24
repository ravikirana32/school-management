# P20 Timetable Exceptions & Room API

All routes require authentication, active school membership and School Admin access except the existing teacher self-service daily timetable route. All database reads/writes use tenant transaction context.

## Rooms

- `GET /api/v1/:organizationId/:schoolId/timetable/rooms` — active room inventory (maximum 500).
- `POST /api/v1/:organizationId/:schoolId/timetable/rooms` — create `{ code, name, roomType?, capacity?, floor? }`; code is normalized to uppercase and unique per school.
- `DELETE /api/v1/:organizationId/:schoolId/timetable/rooms/:roomId` — soft-deactivate.

## Date exceptions

- `GET /api/v1/:organizationId/:schoolId/timetable/exceptions?date=YYYY-MM-DD` — list exceptions for one school-local date.
- `POST /api/v1/:organizationId/:schoolId/timetable/exceptions` — create or update the occurrence identified by `{ timetableSlotId, exceptionDate }`.
- `DELETE /api/v1/:organizationId/:schoolId/timetable/exceptions/:exceptionId` — soft-deactivate.

Example cancellation:

```json
{
  "timetableSlotId": "slot-id",
  "exceptionDate": "2026-11-20",
  "exceptionType": "CANCEL",
  "reason": "School event"
}
```

Example substitute:

```json
{
  "timetableSlotId": "slot-id",
  "exceptionDate": "2026-11-20",
  "exceptionType": "SUBSTITUTE",
  "substituteAssignmentId": "teacher-assignment-id",
  "reason": "Original teacher on approved leave"
}
```

Example one-day override:

```json
{
  "timetableSlotId": "slot-id",
  "exceptionDate": "2026-11-20",
  "exceptionType": "OVERRIDE",
  "startsAt": "10:00",
  "endsAt": "11:00",
  "room": "SCIENCE-LAB",
  "reason": "Assembly schedule adjustment"
}
```

The teacher daily timetable API now returns exception details, display time/room fields, substitute assignments and `schoolClosed`. Cancelled periods are excluded from `slots` and summarized in `cancelledSlots`.
