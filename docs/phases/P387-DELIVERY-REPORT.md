# P387 Delivery Report — Tenant-Scoped Onboarding Assignment State Reset


## Implementation

`apps/school-admin/src/OnboardingWorkspace.tsx` now clears assignment roster, task-to-owner map, assignment-load error, task-level save errors, save success indicators, and in-flight assignment flags when a readiness load starts. This prevents previous school/scope assignment data and stale feedback from being shown while loading the next scope or after a failed assignment refresh.

Added `scripts/verify-p387-onboarding-tenant-assignment-reset.mjs` and root package script `verify:p387`.

## Verification

- P387: 8/8 source-contract checks passed.
- P370–P386 regression verifiers: all passed.
- TypeScript syntax scan: 247 files, 0 parse errors.
- Package manifest/script audit: 13 packages, 0 errors.
- Cumulative ZIP preservation/integrity: PASS.

Static/source checks only. API, DB, build, browser and E2E tests were not run.

## F03 status

F03 Core School Onboarding is still `IN_PROGRESS`. This phase closes only a UI state-isolation slice and does not claim overall onboarding completion.
