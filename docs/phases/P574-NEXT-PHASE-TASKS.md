# P574 Next-Phase Tasks — Dependency-backed Builds & API Integration

**Cycle:** C2-11. **Baseline:** P573 cumulative. **Prerequisite:** P573 lockfile, frozen install, Prisma validation/client generation and clean/upgraded PostgreSQL migration gates must first pass in a registry-enabled environment.

1. Complete P573 blocked prerequisites; do not bypass them with synthetic artifacts.
2. Run clean frozen workspace install for all 14 packages and capture environment/logs.
3. Run semantic typechecks and production builds for all nine applications, API and shared packages.
4. Resolve TypeScript, module-resolution, Expo/native, generated Prisma client and bundler errors without weakening compiler settings.
5. Establish isolated PostgreSQL test lifecycle and deterministic seed/cleanup.
6. Run API/database integration tests for auth, tenant scope, admissions, student lifecycle, parent/teacher/staff/driver, finance, Library, Transport and Hostel.
7. Add representative cross-module end-to-end API journeys and negative authorization tests.
8. Run full static verifier suite and retain every existing acceptance check.
9. Update gap register only with reproducible build/integration evidence; carry forward all unverified RLS/provider/mobile/accessibility gaps.
10. Deliver phase and cumulative ZIPs with SHA-256, file manifest and CRC verification.

**Exit criteria:** frozen install PASS; all 14 package typechecks/builds PASS; Prisma-generated client compatibility PASS; PostgreSQL-backed API integration suite PASS. If P573 remains blocked, report P574 BLOCKED rather than bypassing prerequisites.
