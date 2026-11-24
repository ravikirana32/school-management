# P581 Next-Phase Tasks — Reproducible Workspace & Dependency Closure

**Baseline:** P580 cumulative.

## Priority sequence
1. Obtain network/registry access and generate the authentic pnpm 9.15.0 lockfile from the exact workspace manifests; do not hand-author or fabricate it.
2. Run `pnpm install --frozen-lockfile` in a clean environment and retain logs.
3. Run Prisma format, validate and generate; resolve schema/client issues.
4. Run `docker compose --env-file .env.docker -f docker-compose.local.yml config` on a Docker-enabled host.
5. Build the local workspace image and start PostgreSQL, Redis, migrations, API and all four web apps.
6. Retain container logs, health state, migration output and HTTP smoke evidence.
7. Run all workspace semantic typechecks and production builds; keep local dev image acceptance separate from production image acceptance.
8. Reconcile the 737 open feature/acceptance rows; do not close any without implementation and verification evidence.

## Required evidence
- Authentic committed `pnpm-lock.yaml` and successful frozen install.
- Prisma schema validation and generated-client evidence.
- Docker Compose config/build/up logs and container health output.
- PostgreSQL clean/upgrade migration logs and schema verification.
- API liveness/readiness plus HTTP smoke for all four web apps.
- Semantic typecheck and production build reports for all 14 workspaces.
- Updated gap matrix with status, owner and next action for each reconciled item.

## Release boundary
P581 does not automatically authorize production. Tenant isolation, provider, mobile/device, accessibility, DR, security/privacy and independent operational gates remain separate acceptance workstreams.
