# P18 migration

Apply `20261116230000_p18_teacher_timetable` after all earlier migrations. It adds the composite unique key to TeacherAssignment and creates TeacherTimetableSlot with tenant-scoped assignment FK, checks, indexes and forced RLS. Validate against the exact P17 database before production.
