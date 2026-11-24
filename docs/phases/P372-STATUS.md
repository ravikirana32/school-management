# P372 Status — Onboarding Dependency Gates (C2-04 / F03)

**Status:** Source implementation completed; runtime/build acceptance pending.
**Cycle:** Cycle 2 · C2-04 Core School Workflows (F03–F11)
**Feature slice:** F03 organization/school onboarding and configuration

## Delivered
- Added explicit prerequisite metadata to the readiness steps.
- Academic year setup requires school profile completion.
- Terms require an active academic year.
- Default calendar requires school profile and active academic year.
- Working-day setup requires school profile completion.
- Attendance and grading policy setup require school profile and active academic year.
- Configure actions are disabled when prerequisites are not satisfied.
- Accessible explanatory text lists unmet prerequisites.
- All-steps list applies the same gating; step navigation remains available for review.
- Checklist completion remains API-derived; no step navigation or gate bypass marks an item complete.

## Verification
- `node scripts/verify-p372-onboarding-dependency-gates.mjs`: 14/14 PASS.
- P370 and P371 verifiers rerun; results recorded in P372 test report.
- TS/TSX syntax scan rerun; results recorded in P372 test report.
- Full dependency-based build/typecheck/runtime/E2E remains pending due inherited lockfile/bootstrap blocker.

## Remaining F03 gaps
- Persisted wizard progress and server-side checklist ownership.
- School owner/admin invitations and assignment.
- Dependency-ordered configuration for grades, sections, subjects, rooms, fees and roles beyond the currently represented readiness steps.
- Readiness validation that blocks invalid/incomplete setup where appropriate, beyond this UI-level prerequisite gating.
- Multi-campus inheritance/overrides.
- Bulk configuration import/export with preview and rollback.

## Gap disposition
P372 closes only source-level UI prerequisite gating. It does not claim configuration writes, persistence, backend enforcement, or runtime acceptance.
