# C2-01 — Workspace Stabilization & Baseline Validation

## Baseline
- Cumulative source: P358
- Node tested: v22.16.0
- Expected package manager: pnpm 9.15.0
- TypeScript baseline dependency: 5.7.2 (global test tool available was 5.8.3)

## Commands once dependency installation is available

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install --frozen-lockfile
pnpm verify:c2-01
pnpm check:source-syntax
pnpm typecheck
pnpm lint
pnpm test
pnpm test:domain-rules
pnpm build
```

## API/database startup sequence

```bash
pnpm infra:up
pnpm db:generate
pnpm db:deploy
pnpm db:seed
pnpm dev:api
```

Use `.env.example` for local development. Production uses `.env.prod.example` as the starting template, a separate `secrets/` directory with secret files, and `certs/` TLS files. Do not commit real environment files, credentials, private keys, or production secrets.

## Mobile bundle checks

For each Expo workspace (`teacher-mobile`, `parent-mobile`, `student-mobile`, `staff-mobile`):

```bash
pnpm --filter @school-saas/teacher-mobile typecheck
pnpm --filter @school-saas/teacher-mobile build
```

Repeat for the other three mobile packages. `build` uses Expo's static export/bundle check; it is not a signed native release build or device acceptance test.

## Current C2-01 source changes
- Fixed TypeScript/TSX parse defects in Transport routes, AdmissionsWorkspace, and OperationalModulesWorkspace student-photo UI.
- Added a repository TypeScript syntax scanner (`scripts/check-source-syntax.mjs`).
- Added workspace manifest/config checker (`scripts/verify-c2-01-workspace.mjs`).
- Added root scripts for C2-01 verification and syntax checking.
- Declared Node 22 and pnpm 9.15 engines.
- Added Expo `build` and `lint` scripts to all four mobile workspaces.
- Added missing Teacher Mobile Expo scheme.
- Added shared flat ESLint configuration and root lint dependencies.
- Updated stale static-verifier assumptions for P47, P110, P117, P119 and P120.
- Made production environment checker fail with a controlled message when `.env.prod` is missing instead of an uncaught stack trace.

## Current blocker
The P358 archive does not include `pnpm-lock.yaml` or installed dependencies. Network DNS/registry access was unavailable in the work environment, so pnpm could not be bootstrapped. This prevents clean installation, dependency resolution, full typecheck, lint, application builds, Prisma generation/migration, API startup, Docker services, Expo native/device validation and full runtime/E2E checks. Do not treat the C2-01 release as fully validated until these blockers are cleared.
