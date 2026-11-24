# P20 Phase Report — Academic Calendar & Timetable Exceptions

**Date:** 2026-11-16  
**Status:** Source implementation completed; runtime acceptance pending.

## Implemented

1. Added Prisma enum and models for `SchoolRoom` and `TeacherTimetableException`.
2. Added migration with school-scoped room code uniqueness, slot/date exception uniqueness, composite tenant foreign keys, checks, indexes and forced RLS.
3. Added School Admin room inventory list/create/deactivate endpoints.
4. Added School Admin date exception list/create-or-update/deactivate endpoints.
5. Added CANCEL, SUBSTITUTE and OVERRIDE semantics; substitute assignment is constrained to the same school and academic year and checked for timetable conflicts.
6. Updated teacher daily timetable projection to apply one-day time/room overrides, hide cancelled periods, expose substituted classes to substitute teachers, and suppress regular slots for non-instructional holiday/closure events.
7. Added transaction-scoped advisory locks for timetable create/update/bulk and exception mutations to serialize API-mediated conflict checks per school/academic year.
8. Updated Teacher app timetable rendering to use effective display times/rooms and label substitute periods.
9. Added P20 module, API, security, migration and phase documentation; updated root/docs gap registers and status files.

## Verification

- Static source assertions: PASS (12 targeted checks).
- TypeScript/TSX syntax transpilation: PASS for the changed API route, test source and Teacher mobile app.
- Prisma validation/client generation: not run (dependencies not installed).
- PostgreSQL migration/RLS integration: not run.
- Vitest: not run.
- API integration and concurrency tests: not run.
- Expo build/device E2E: not run.
- Cumulative ZIP integrity: PASS after packaging (see archive check).

## Known limitations

- Room inventory is not yet enforced as the only accepted timetable room value; the legacy text field remains for compatibility.
- Advisory locks protect writes that use the timetable API lock protocol; direct SQL writers can bypass it.
- No CSV import/export, visual School Admin editor, reusable bell templates, substitute notification delivery or mobile week/offline support.
- Holiday suppression and substitute projection need PostgreSQL/API/device tests, including school timezone and daylight-saving scenarios.

## Exit decision

P20 source work is complete, but it is not production-ready. Do not close runtime, RLS, migration, security or E2E gaps until corresponding automated evidence is available.
