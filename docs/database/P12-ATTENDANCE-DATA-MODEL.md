# P12 Attendance Data Model

Tables: `AttendanceSession`, `StudentAttendance`, `AttendanceCorrectionRequest`, `AttendanceAuditEvent`.

Tenant safety:
- Composite organization/school foreign keys to School, AcademicYear, GradeLevel, Student, StudentEnrollment and AttendanceSession.
- Unique session/date/class scope (null section normalized to empty string in SQL).
- Unique student per session.
- Forced PostgreSQL RLS on all four tables, requiring both organization and school transaction settings.
- Enrollment membership in the session's grade/year/section is checked by the API transaction because a simple FK cannot express this multi-column semantic relationship.

Prisma models intentionally use scalar IDs; composite foreign keys and RLS are defined in the SQL migration.
