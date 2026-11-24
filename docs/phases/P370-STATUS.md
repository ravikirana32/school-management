# P370 Status — C2-04 Guided School Onboarding Readiness

**Status:** Source implementation completed; runtime/build acceptance remains pending.
**Cycle:** Cycle 2 · C2-04 Core School Workflows (F03–F11)
**Feature slice:** F03 Organization/school onboarding and configuration

## Delivered
- Added a permission-gated Guided onboarding workspace in School Admin.
- Added a read-only checklist sourced from existing school configuration APIs.
- Checklist covers school identity, active academic year, academic terms, default calendar, working-day setup, attendance policy and grading policy.
- Added Configure/Review navigation to the corresponding existing School Configuration workspaces.
- Added manual refresh and visible loading/error states.
- Checklist readiness is explicitly labeled as configuration readiness, not runtime acceptance or compliance.
- Added a dependency-free P370 verifier and package script.

## Verification
- `node scripts/verify-p370-guided-onboarding.mjs`: 13/13 PASS.
- `node scripts/check-source-syntax.mjs`: 247 files scanned, 0 parse errors.
- Full workspace build/typecheck/runtime/E2E not run: dependency bootstrap/lockfile blocker remains from P369.

## Remaining F03 work
- Guided configuration wizard (write workflow/step persistence).
- School owner/admin invitations and onboarding checklist ownership.
- Dependency-ordered setup orchestration across grade/section/subject/room/fee/role configuration.
- Readiness validation that blocks invalid/incomplete setup where appropriate.
- Multi-campus inheritance/override controls.
- Bulk import/export with preview and rollback.

## Gap disposition
P370 closes only the delivered source implementation slice and verifier contract. The above remaining F03 items stay OPEN.
