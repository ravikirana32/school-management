# Local Development – P01

## Prerequisites
- Node.js 22 LTS.
- pnpm 9.15.x (Corepack recommended).
- Docker Desktop / Docker Engine with Compose v2.
- Expo Go or Android Studio/Xcode for mobile device/simulator testing.

## Setup
1. Clone or extract the repository.
2. Enable Corepack: `corepack enable`.
3. Activate pnpm: `corepack prepare pnpm@9.15.0 --activate`.
4. Copy repository-root `.env.example` to repository-root `.env`. The API loads this root file by default; set `ENV_FILE` to override.
5. Replace both JWT development secrets with random strings of at least 32 characters.
6. Install dependencies: `pnpm install` (this generates `pnpm-lock.yaml`; commit it so CI can use frozen installs).
7. Start infrastructure: `docker compose up -d postgres redis`.
8. Generate Prisma client: `pnpm db:generate`.
9. Apply local migration: `pnpm db:migrate`.
10. Seed development setting: `pnpm db:seed`.

## Run API
`pnpm dev:api`

- Liveness: `http://localhost:8080/health/live`
- Readiness: `http://localhost:8080/health/ready`
- API information: `http://localhost:8080/api/v1`

## Run web apps
Run each command in a separate terminal:
- `pnpm dev:super-admin`
- `pnpm dev:organization-admin`
- `pnpm dev:school-admin`
- `pnpm dev:public-portal`

Vite chooses an available port if the default port is occupied. Configure fixed ports in each Vite config before shared QA automation.

## Run mobile apps
- `pnpm dev:teacher-mobile`
- `pnpm dev:parent-mobile`

Use Expo Go or a configured simulator. Native builds require platform toolchains.

## Quality commands
- `pnpm --filter @school-saas/api typecheck`
- `pnpm --filter @school-saas/api test`
- `pnpm --filter @school-saas/super-admin build`
- `pnpm --filter @school-saas/organization-admin build`
- `pnpm --filter @school-saas/school-admin build`
- `pnpm --filter @school-saas/public-portal build`

## Stop infrastructure
`docker compose down`

To remove local database/cache data (destructive): `docker compose down -v`.

## Safety
The supplied credentials are development-only. Never reuse them in staging or production. Do not commit `.env`. P01 does not include production deployment secrets or public exposure configuration.
