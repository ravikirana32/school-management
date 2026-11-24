# P25 — School Admin Permission Guards & Timetable Database Acceptance

## Delivered source changes

### Permission-aware School Admin workspace
- The shared School Admin session now loads effective permissions from `GET /api/v1/:organizationId/:schoolId/access/me/permissions` whenever the active school changes.
- Navigation is capability-driven, not based on display role names. Exact permissions, module wildcards (`module.*`) and global `*` follow the backend permission semantics.
- Unauthorized tabs are not rendered in navigation; if permissions change and the current tab becomes unauthorized, the workspace moves to the first permitted module.
- Preview-only tabs are visibly marked and explicitly state that changes remain local and are not persisted. They do not make API writes.
- Attendance requires `attendance.manage`; timetable requires `academics.manage`.

### School Administrator permission bootstrap
- The idempotent seed links the complete permission catalogue to the `SCHOOL_ADMIN` role.
- Organization onboarding links all permission rows currently present to the new school administrator role.
- This repairs existing SCHOOL_ADMIN role permission links when the seed is rerun.
- Other roles retain their deliberately limited permission sets.

### Timetable API authorization
- Timetable management APIs now allow either the established SCHOOL_ADMIN role or an active school member with `academics.manage`.
- Membership and tenant scoping remain mandatory.
- Teacher self-service routes remain scoped to the teacher's own assignments.

### Database enforcement
- A PostgreSQL trigger serializes every active timetable slot write using the school-scoped advisory lock.
- It rejects recurring teacher overlap across assignments, room overlap, and date-range-overlapping collisions.
- A second trigger validates date-specific SUBSTITUTE and OVERRIDE exceptions against the effective schedule on that date; CANCEL exceptions do not consume a teacher or room.
- SUBSTITUTE exceptions require a substitute assignment.
- AuditLog is append-only at the database layer: direct UPDATE and DELETE fail with SQLSTATE `55000`.

## Explicitly not delivered
- School profile, academic year, calendar, working days, policies, curriculum, student, staff and access screens remain local preview modules; they are now clearly labelled and permission-gated rather than implying persistence.
- The database migration has not been applied in this environment. Existing timetable overlaps are not automatically rewritten; migration deployment requires a preflight report and acceptance tests.
- No claim is made that PostgreSQL, Prisma, Vitest, browser or device tests ran.
