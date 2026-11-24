# P372 Delivery Report

## P372 — Onboarding Dependency Gates

Continued C2-04/F03 from P371. The existing onboarding wizard now explicitly models setup prerequisites, computes unmet prerequisites from live readiness state, disables Configure actions until dependencies are met, and displays an accessible explanation. The full checklist keeps the same prerequisite gate. Step navigation remains available for review and does not mutate readiness.

## Files added
- `scripts/verify-p372-onboarding-dependency-gates.mjs`
- `P372-STATUS.md`
- `P372-TEST-REPORT.md`
- `P372-DELIVERY-REPORT.md`
- `P372-ZIP-VERIFICATION.txt`

## Files changed
- `apps/school-admin/src/OnboardingWorkspace.tsx`
- `package.json`
- `MASTER-OPEN-GAPS-REGISTER.md` (mirrored under docs and docs/phases)
- `MASTER-ACTIVE-GAPS-REGISTER.md` (mirrored under docs)
- `FINAL-DETAILS-ALL-FEATURES.md` (mirrored under docs)
- `CHANGELOG.md` (mirrored under docs)

## Verification boundary
Source verifiers and syntax scan pass. Full typecheck/build/runtime and E2E acceptance remain unverified due the inherited dependency bootstrap/lockfile blocker. UI gating is not backend authorization or configuration enforcement.
