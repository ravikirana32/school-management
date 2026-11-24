# P476 — Parent Academic Planner Backend Integration

## Delivered
- Added parent-scoped `GET .../timetable`, `GET .../calendar`, and `GET .../exams` handlers in the parent router.
- All three require authenticated access, active parent portal permission, accepted/consented guardian relationship, and a communication-enabled guardian/student link. A school/tenant/student scope is included in database predicates.
- Timetable returns date occurrences for the requested period, honoring recurring weekday, assignment and slot effective dates, and cancellation/override/substitute exceptions.
- Calendar returns only events addressed to ALL, STUDENTS, or PARENTS that overlap the requested range; STAFF-only events are excluded.
- Exams returns only PUBLISHED exams matching linked child's active enrollment academic year, grade and section.
- Request requires valid `from`/`to` dates, ordered and bounded to 36 days; response includes requested range.
- API output is intentionally minimal and omits internal teacher assignment identifiers and student marks.

## Authorization notes
Parent portal permission `parent.portal.read` is used for the academic read routes. The `parentScope` gate checks active school and organization memberships, parent role permission, accepted invitation, consent, verified guardian and visible communication-enabled link. `parentPlannerContext` independently verifies the specific student link before child academic data is read.

## Limitations / follow-up gaps
- The API source was statically inspected and updated; backend dependency installation, typecheck, database migration validation and runtime requests were not executed in this environment.
- Academic event publication controls are represented by event audience. Calendar events have no separate published status field in the inspected model.
- Parent academic planner cache/offline persistence, mobile E2E, device accessibility, and performance acceptance remain open.
