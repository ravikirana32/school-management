# P18 API — Teacher timetable

All endpoints require a bearer access token and active school membership.

- `GET /api/v1/:organizationId/:schoolId/teacher/me/timetable?date=YYYY-MM-DD` — teacher's own periods, teacher-visible calendar events and related attendance sessions. A linked active staff profile is required.
- `GET /api/v1/:organizationId/:schoolId/timetable/slots?academicYearId=...` — School Admin list.
- `POST /api/v1/:organizationId/:schoolId/timetable/slots` — School Admin create. Required fields: `teacherAssignmentId`, `academicYearId`, `dayOfWeek` (1–7), `periodNumber` (1–20), `startsAt`, `endsAt`, `subjectName`; optional `room`, `effectiveFrom`, `effectiveTo`.
- `DELETE /api/v1/:organizationId/:schoolId/timetable/slots/:slotId` — School Admin soft-deactivate.

Teacher read derives identity from the authenticated user and filters to active, date-effective assignments. Tenant IDs in the URL are verified against active membership and transaction-local tenant context.
