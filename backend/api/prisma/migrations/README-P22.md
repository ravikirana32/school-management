# P22 migration — canonical room and lifecycle guards

Apply after the P21 timetable template migration. Adds school-scoped PostgreSQL advisory-lock coordination to room updates and timetable slot/exception room writes, blocks changing a referenced room code, blocks deactivation while active timetable references exist, and rejects slot/exception writes that reference a missing or inactive canonical room. API timetable writers also acquire the school-wide lock before academic-year locks.

The migration relies on transaction-local tenant context and forced RLS policies on the affected tables. Verify using the production application DB role, not a superuser. Existing historical free-text room labels are not rewritten by this migration; if they are updated or reinserted with a room value, the canonical active room rule applies.

Rollback: drop the three triggers, then the three functions:
`DROP TRIGGER timetable_exception_room_guard_trigger ON "TeacherTimetableException";`
`DROP TRIGGER timetable_slot_room_guard_trigger ON "TeacherTimetableSlot";`
`DROP TRIGGER school_room_reference_guard_trigger ON "SchoolRoom";`
`DROP FUNCTION timetable_exception_room_guard(); DROP FUNCTION timetable_slot_room_guard(); DROP FUNCTION school_room_reference_guard();`
