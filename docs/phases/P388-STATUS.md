# P388 Status — School-Scope Readiness Reset

- **Workstream:** C2-04 / F03 Core School Onboarding
- **Status:** Completed source slice; F03 remains IN_PROGRESS
- **Baseline:** P387 cumulative work tree
- **Issue:** Checklist readiness state, last-refresh timestamp, and recommended-next-step could remain visible while switching schools or when the session temporarily lacked an active school.
- **Change:** Readiness checklist and timestamp/recommendation state are cleared at the start of each load. Missing session scope now exits safely after clearing stale data and ending loading state.
- **Verification:** P388 source verifier 8/8 PASS; P370–P388 verifier batch PASS; TypeScript syntax scan 247 files / 0 parse errors.
- **Not run:** DB migration/runtime, API build/runtime, browser/device, E2E acceptance.
- **Next:** P389. F04 remains blocked until F03 closure evidence is complete.
