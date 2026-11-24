# P387 Status — Tenant-Scoped Onboarding Assignment State Reset

- **Workstream:** C2-04 / F03 Core School Onboarding
- **Status:** Completed source slice; F03 remains IN_PROGRESS
- **Baseline:** P386 cumulative work tree
- **Issue addressed:** During onboarding workspace refresh or school-scope change, task assignment roster/map, prior save errors, success feedback and in-flight flags could remain in UI state until the new assignment payload loaded. If the new assignment request failed, stale data could persist.
- **Change:** At the start of each readiness load, reset assignment roster/map, assignment-load warning, per-task errors, per-task save feedback and per-task saving map. Readiness loading then continues normally.
- **Verification:** P387 verifier 8/8 PASS; source verifiers P370–P386 PASS; TypeScript syntax scan 247 files / 0 parse errors; package-manifest audit 13 packages / 0 errors.
- **Not run:** Prisma CLI validation/client generation, DB migrations, API/web builds, live API runtime, browser/device and E2E acceptance.
- **Next:** P388. F03 remains open; F04 remains blocked.
