# P378 Status — Onboarding task ownership (C2-04/F03)

## Implemented
- Added `SchoolOnboardingTaskAssignment`, keyed uniquely by organization, school and checklist task.
- Added SQL migration, assignee index, and forced tenant RLS for task assignments. Also retrofitted forced tenant RLS to P377 progress persistence.
- Added permission-gated GET endpoint returning active school member roster and persisted task assignments.
- Added permission-gated PUT endpoint for assign/unassign task owners.
- Validates task key against the seven onboarding steps.
- Validates assignee is an active user with active membership in the exact school.
- Writes audit records for assignment updates and removals.
- School Admin renders assignee selectors for each setup task and saves changes through the API.
- Displays save feedback and nonfatal API/permission error messaging; checklist completion remains API-derived.

## Verification
- P378 source-contract verifier: 19/19 PASS.
- P370–P377 regression verifiers: PASS (individual results in P378 test report).
- TypeScript/TSX syntax scan: 247 files scanned, 0 parse errors.
- Prisma client generation/schema validation, API typecheck/build, database migration execution, live API and browser E2E: not run; dependency bootstrap/lockfile is unavailable in this environment.
