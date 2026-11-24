# P361 — C2-01 Dependency-Free CI Source Gate

**Status:** Source-level CI improvement delivered; C2-01 remains blocked pending dependency installation and runtime validation.

## Implemented
- Added `scripts/verify-c2-01-ci-source.mjs`, a dependency-free orchestrator for four checks: TypeScript/TSX syntax, workspace manifest integrity, domain invariant tests, and P80–P108 source contracts.
- Added root script `verify:c2-01:ci-source`.
- Added a separate `source-only-gates` job to `.github/workflows/ci.yml`, so core source checks can run even while lockfile/install/build jobs are blocked.
- Added the same source-gate invocation before the lockfile/install requirement in the existing CI build job.

## Validation
- Source gate: 4/4 PASS.
- TypeScript/TSX parser: 246 files scanned, 0 parse errors.
- Workspace manifests: 13 inspected, 13 unique names, 0 errors.
- Domain invariant tests: 20/20 PASS.
- P80–P108 source-contract check: PASS.

## Remaining C2-01 blockers
- No pnpm lockfile; registry access was previously blocked by `EAI_AGAIN`.
- Dependency-based typecheck/lint/build, Prisma validation/generation, DB migration, API runtime, web builds, Expo exports/device checks, full E2E/security tests, and production deployment acceptance remain unverified.
- C2-01 is not accepted; do not proceed to C2-02 until these acceptance blockers are resolved.
