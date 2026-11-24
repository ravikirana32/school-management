# P573 Next-Phase Tasks — Prisma & PostgreSQL Migration Acceptance

**Cycle:** C2-11. **Baseline:** P572 cumulative. **Prerequisite:** exact pnpm 9.15.0 registry-resolved lockfile and frozen install.

1. Obtain a network-enabled or approved mirrored npm registry environment; install pinned pnpm 9.15.0 under Node 22.
2. Generate `pnpm-lock.yaml` from all 14 workspace package manifests using the real package manager and registry metadata; do not hand-author it.
3. Run `pnpm install --frozen-lockfile`; record exact command, environment, package counts and output.
4. Run Prisma format, validate and client generation for the canonical API schema.
5. Apply all migrations to an empty PostgreSQL database; verify schema and seed baseline.
6. Upgrade a database snapshot from the previous supported schema; capture migration ordering, locks, runtime and schema drift.
7. Exercise rollback/recovery or documented forward-fix strategy for failed migrations.
8. Add automated migration smoke tests to CI; fail closed on drift or missing migration artifacts.
9. Update P572-G001–G004 only when reproducible evidence exists; retain all other P572/P571 gaps.
10. Deliver phase and cumulative archives with manifest, SHA-256 and ZIP CRC verification.

**Exit criteria:** lockfile/frozen install PASS; Prisma format/validate/generate PASS; clean and upgraded PostgreSQL migration suites PASS. If environment prerequisites remain unavailable, report BLOCKED and do not mark acceptance complete.
