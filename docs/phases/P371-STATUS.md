# P371 Status — Guided Onboarding Step Navigation (C2-04 / F03)

**Status:** Source implementation completed; runtime/build acceptance pending.
**Cycle:** Cycle 2 · C2-04 Core School Workflows (F03–F11)
**Feature slice:** F03 organization/school onboarding and configuration

## Delivered
- Extended the P370 readiness checklist into a sequential guided-step navigator.
- Added accessible step labels and current-step semantics.
- Added previous/next navigation with boundary disabled states.
- Added a recommended-next action based on the first actual incomplete readiness item.
- Added an all-steps details list so users can jump to a checklist item.
- Kept completion sourced from authenticated, school-scoped configuration API data; navigation does not mark steps complete.
- Preserved the read-only readiness disclaimer and Configure/Review routing.

## Verification
- `node scripts/verify-p371-onboarding-step-navigation.mjs`: 13/13 PASS.
- `node scripts/verify-p370-guided-onboarding.mjs`: 13/13 PASS.
- `node scripts/check-source-syntax.mjs`: 247 files scanned; 0 parse errors.
- Full dependency-based build/typecheck/runtime/E2E not run because inherited lockfile/bootstrap blocker remains.

## Remaining F03 gaps
- Persisted wizard progress and server-side checklist ownership.
- School owner/admin invitations and assignment.
- Dependency-ordered setup orchestration across grade/section/subject/room/fee/role configuration.
- Readiness validation that blocks invalid or incomplete setup where appropriate.
- Multi-campus inheritance/overrides.
- Bulk import/export with preview and rollback.

## Gap disposition
P371 closes the guided step-navigation slice only. It does not claim configuration writes, persistent progress, or runtime acceptance.
