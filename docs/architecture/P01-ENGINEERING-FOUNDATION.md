# P01 Engineering Foundation

## Workspace
pnpm workspace with `apps/*`, `backend/*` and `packages/*`.

## Apps
- `apps/super-admin`
- `apps/organization-admin`
- `apps/school-admin`
- `apps/public-portal`
- `apps/teacher-mobile`
- `apps/parent-mobile`
- `backend/api`

## Shared packages
- `packages/shared-types`
- `packages/validation`
- `packages/api-client`

## API baseline
Express app with Helmet, explicit CORS allowlist, JSON size limit, request logging, request ID, liveness/readiness and versioned API root. Error envelope and not-found handler are initialized.

## Database baseline
Prisma configured for PostgreSQL. Initial `platform_settings` table proves migration/seed workflow shape. This is intentionally not the tenant schema; tenancy and identity schemas are implemented after their detailed design in P02/P04.

## Local infrastructure
Docker Compose starts PostgreSQL 16 and Redis 7 with persistent volumes and health checks. Ports bind to localhost only.

## CI
GitHub Actions installs pnpm dependencies, typechecks/tests API and builds four web applications. Mobile build automation is a tracked follow-up.
