# P25 Phase Report — School Admin Permission Guards & Timetable Database Acceptance

**Status:** Source implementation complete; runtime acceptance pending.

## Implemented

1. Shared School Admin session retrieves school-scoped effective permission keys on tenant selection.
2. Capability-based navigation supports exact, module wildcard and global wildcard permissions.
3. Local-only profile, academic, calendar, working-day, policy, curriculum, student, staff and access modules are visibly labelled as preview-only and gated by read/manage permissions.
4. Attendance navigation requires `attendance.manage`; timetable navigation requires `academics.manage`.
5. Timetable APIs authorize SCHOOL_ADMIN or active members with `academics.manage` while retaining tenant membership checks.
6. SCHOOL_ADMIN receives all current permission catalogue rows through idempotent seed and organization onboarding.
7. PostgreSQL triggers enforce recurring teacher/room overlap checks and date-specific exception overlap checks under the school-wide advisory lock.
8. AuditLog UPDATE/DELETE are rejected by database triggers.
9. Added permission helper tests and a PostgreSQL acceptance checklist.

## Static verification

- Targeted static source assertions: **17/17 PASS**.
- TypeScript/TSX syntax transpilation with global TypeScript 5.8.3: **7/7 PASS**.
- Root/docs master gap register parity: **PASS**.
- Cumulative ZIP integrity: **PASS** (413 archive entries; P00–P25 project).

## Not executed

No package installation, Prisma validation/client generation, PostgreSQL migration, RLS/trigger integration test, Vitest suite, full TypeScript typecheck, app build, API integration, Playwright or mobile device test was executed. Do not treat source implementation as runtime acceptance.

## Open risks

- Migration may reveal pre-existing timetable conflicts; preflight and remediation are required.
- PostgreSQL trigger behavior needs tests using the normal non-owner application role and two concurrent connections.
- Audit append-only triggers can be bypassed by privileged database owners; production privilege separation and external immutable retention are still required.
- Preview-only modules are intentionally not production workflows.
- Browser reload session restoration remains absent; tokens remain memory-only.
