# P574 Feature / Verification Contract

P574 introduces a fail-closed workspace prerequisite preflight, not new end-user functionality.

## Command
`pnpm verify:p574:preflight` (or `node scripts/p574-build-integration-preflight.mjs` before pnpm is installed).

## Required checks
- Node major 22.
- Authentic `pnpm-lock.yaml`.
- Exact root package manager pin `pnpm@9.15.0`.
- pnpm executable.
- Docker CLI, PostgreSQL client and Prisma CLI.
- Exactly 14 workspace package manifests.
- Root dependency installation (`node_modules`).

The script emits JSON and exits with code 2 if any required prerequisite is missing. It does not create a lockfile, install packages, start infrastructure or claim successful builds.
