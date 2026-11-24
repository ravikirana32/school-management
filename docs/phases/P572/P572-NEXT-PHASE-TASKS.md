# P572 Next Phase Tasks — Consolidated Release-Gate Remediation (Wave 1)

**Baseline:** P571 cumulative. **Purpose:** Begin closing the highest-risk P571 acceptance blockers without weakening or deleting historical coverage.

## P572 scope
1. Restore a reproducible workspace: pin pnpm 9.15.0, generate and commit `pnpm-lock.yaml`, verify workspace package manifests and CI install behavior.
2. Triage all 29 failing static verifiers individually. Classify each as a real regression, stale assertion, missing target or workspace defect; update source/tests only with evidence. Target **357/357** passing verifiers.
3. Install dependencies in a network-enabled build environment and run Prisma format, validate and client generation. Resolve schema/client drift.
4. Run all migrations against clean and upgraded PostgreSQL; retain logs and schema-diff evidence.
5. Run dependency-backed typechecks/builds for the API, shared packages and all nine applications; fix failures without reducing type safety.
6. Add a repeatable local/CI database test harness and execute core API integration tests.
7. Keep all 665 existing unchecked gap records and all P571-G001–G012 open until their own acceptance evidence is attached.

## Required acceptance evidence
- Committed lockfile and successful frozen-lockfile install.
- 357/357 static verifiers pass, or each intentionally retired verifier has a documented replacement and approved disposition.
- Prisma format/validate/generate pass.
- Clean and upgraded PostgreSQL migration runs pass with no unexplained drift.
- API/shared packages/all applications pass semantic typecheck and production build.
- Database-backed integration test report with reproducible setup and teardown.
- Updated gap register with evidence references; no status-only closures.

## Deferred to later remediation waves
Production-role RLS/cross-tenant matrix, concurrency/load, payment and notification provider E2E, browser/device/offline/accessibility, and independent privacy/security/legal review remain mandatory follow-on work after the workspace/database foundation is stable.
