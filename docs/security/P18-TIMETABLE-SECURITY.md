# P18 timetable security

- Forced RLS on `TeacherTimetableSlot` with organization and school transaction settings.
- Composite foreign key ties each slot to a teacher assignment in the same organization and school.
- Teacher self-read endpoint never accepts a staff ID or assignment ID.
- School Admin write/list endpoints require active membership plus School Admin authorization.
- Slot data contains timetable metadata only; no student PII is returned by the timetable endpoint.
- Verify RLS using non-owner roles and cross-tenant IDs before production.
