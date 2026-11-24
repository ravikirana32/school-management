# P12 Phase Report — Student Attendance Foundation

## Delivered source
- Prisma enums and four attendance models.
- PostgreSQL migration with composite tenant FKs, uniqueness, checks, indexes, forced RLS.
- Attendance session creation/listing/opening, bulk marks, submit/lock, student record read, correction request/review APIs.
- Teacher class assignment guard and school permission checks.
- Attendance audit events.
- Attendance lifecycle unit test source.
- Local-only School Admin attendance preview component.
- API, module, database and security documentation.

## Verification
- Static artifact checks and ZIP integrity are executed during packaging.
- No dependency installation, Prisma validation/generation, SQL migration, PostgreSQL RLS test, TypeScript build, Vitest run, API integration test, browser E2E or mobile test has been executed in this environment. Runtime acceptance is therefore **NOT VERIFIED**.

## Known limitations
- Attendance entitlement is currently checked at session creation; P12 follow-up must enforce it consistently on all mutations.
- Teacher seed grants `attendance.mark` and `attendance.correct.request`; Principal seed grants `attendance.manage` and `attendance.correct.review`. Verify seeded role grants in a database.
- Admin preview is not connected to API and is not mounted in navigation.
- Teacher assignment requires a section for non-admins and checks the existing grade/section assignment fields; verify these constraints against real seeded assignments.
- AttendancePolicy from P06 is not yet enforced.
- No guardian portal, notification outbox, period attendance, import/export, attendance analytics or correction SLA.
- Concurrency/race tests for session uniqueness, bulk marking and correction review remain open.
