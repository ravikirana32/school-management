# P124 — Attendance and Timetable Authorization Notes

## Attendance session listing
Teacher assignment validity is evaluated against the requested attendance date (or the current date when no date is supplied) in the `TeacherAssignment` query. The subsequent `AttendanceSession` query filters only by its own organization, school, academic year, grade, section and session date fields.

## Student attendance history
School administrators retain the existing attendance-management access. A non-admin reader must have `attendance.read`, an active staff profile, an active student enrollment, and a currently effective teacher assignment matching that enrollment's academic year, grade and section. The returned attendance rows are limited to sessions in those assigned enrollment scopes.

This intentionally does not define unrestricted historical access or substitute-teacher access. Those remain tracked in P122-G003 and P124-G003.

## Correction requests
A teacher correction request is authorized against the exact session academic year and session date, in addition to grade and section. This avoids authorizing an old session solely because the teacher has an assignment in a different year.

## Timetable
The teacher self-timetable route remains bound to the authenticated active staff profile, active assignments, assignment effective dates, active slots and slot effective dates. Timetable configuration endpoints remain restricted to school administrators or `academics.manage`.

## Verification limits
Static source verification does not prove runtime authorization, Prisma query validity, RLS behavior or cross-tenant denial. Those checks remain outstanding.
