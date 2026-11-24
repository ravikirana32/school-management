# P18 — Teacher timetable and daily workspace

## Delivered
- Tenant-scoped `TeacherTimetableSlot` model with weekday, period, time, subject, room and effective-date fields.
- Forced PostgreSQL RLS and composite tenant/teacher-assignment foreign key.
- School Admin APIs to list, create and deactivate slots. Slot creation validates an active teacher assignment in the selected school and academic year.
- Teacher self-service daily timetable endpoint. It derives the teacher from the authenticated identity and active linked staff record; no staff or assignment ID is accepted from the client.
- Daily response combines timetable slots, teacher-visible calendar events and attendance sessions for the teacher's active assignments.
- Teacher mobile daily workspace displays periods and school events alongside the existing attendance workflow.

## Schedule semantics
`dayOfWeek` uses ISO numbering (Monday=1 through Sunday=7). Date filters are date-only values interpreted as school-local dates represented at UTC midnight for database comparisons. Schools should supply dates using their configured timezone. Period time values are local `HH:mm` strings; timezone conversion is intentionally not performed in the API.

## Known limitations
- No timetable import, bulk editor, drag-and-drop, bell schedule, substitute teacher, room conflict, teacher conflict across simultaneous classes, or recurring exception/holiday engine.
- Slot creation checks time overlaps across all active assignments for the same teacher and checks room overlaps within the school. These checks are application-level and are not yet race-safe under concurrent writes; database exclusion constraints or serializable transaction tests remain future work.
- The teacher mobile app displays timetable and events but has no offline cache.
- Runtime migration, API and device acceptance remain pending.
