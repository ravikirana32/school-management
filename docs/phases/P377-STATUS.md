# P377 Status — Server-persisted onboarding resume (C2-04/F03)

## Implemented
- Added `SchoolOnboardingProgress` persistence model keyed uniquely by organization and school.
- Added migration creating the tenant-scoped table and indexes.
- Added GET endpoint to retrieve saved wizard step (defaults to `profile` when absent).
- Added PUT endpoint to save the current wizard step; requires active school membership and `school.settings.manage` permission.
- Validates step keys against the seven allowed onboarding steps.
- Records the last saving user.
- School Admin now loads and saves resume position server-side. Browser local storage remains a fallback if API save fails.
- Readiness completion remains API-derived and is not changed by progress persistence.

## Validation
- P377 source verifier: 12/12 PASS.
- P376 archive checksum and ZIP integrity verified before work.
- API runtime, Prisma migration execution, typecheck/build, live DB integration and E2E acceptance: not run in this environment.

## Remaining F03
Owner/admin invitation and checklist ownership; full configuration write orchestration and backend dependency enforcement; multi-campus inheritance/overrides; bulk configuration import/export preview/rollback; runtime acceptance.
