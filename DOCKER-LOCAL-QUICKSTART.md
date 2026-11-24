# Local Docker Quick Start — School Management SaaS

## Scope

`docker-compose.local.yml` starts PostgreSQL, Redis, the API, and all four web apps (School Admin, Organization Admin, Super Admin and Public Portal). The optional `workers` profile starts eight API background workers; the optional `mobile` profile starts Expo Metro servers for Parent, Teacher, Student, Staff and Driver apps. PostgreSQL/Redis data is persisted in named volumes.

This is a **local development profile**, not production deployment. It uses local-only example credentials and installs dependencies without a frozen lockfile because the P579 repository does not contain an authentic `pnpm-lock.yaml`. Do not use this profile or its credentials in production. Existing production Dockerfiles/Compose remain frozen-lockfile gated.

## Prerequisites

- Docker Engine/Desktop with Compose v2.
- At least 8 GB RAM recommended for the workspace build.
- Network access to the package registry for the first dependency install.

## Start

```bash
cp .env.docker.example .env.docker
# Edit .env.docker and replace the local-only values if desired.
docker compose --env-file .env.docker -f docker-compose.local.yml config
docker compose --env-file .env.docker -f docker-compose.local.yml up --build
```

The first build installs workspace dependencies and generates Prisma Client. Source files are baked into the image (there is no host bind mount); rebuild/recreate the affected service after changing source code. The `migrate` one-shot service runs `prisma migrate deploy`; API startup waits for successful migration, PostgreSQL and Redis health. If migrations fail, inspect `docker compose ... logs migrate` and do not bypass the failure.

## URLs

| App | URL |
|---|---|
| School Admin | http://localhost:5173 |
| Organization Admin | http://localhost:5174 |
| Super Admin | http://localhost:5175 |
| Public Portal | http://localhost:5176 |
| API liveness | http://localhost:8080/health/live |
| API readiness | http://localhost:8080/health/ready |

## Optional background workers

```bash
docker compose --env-file .env.docker -f docker-compose.local.yml --profile workers up --build
```

These workers require their external providers/storage/scanner configuration before corresponding delivery or scan flows can be accepted.

## Optional native mobile servers

```bash
docker compose --env-file .env.docker -f docker-compose.local.yml --profile mobile up --build
```

Expo/Metro port forwarding and QR-code reachability depend on the host LAN, firewall and device network. In each mobile app, set the API base URL to `http://<your-computer-LAN-IP>:8080` (not `localhost`) when testing on a physical device. A successful container start is not proof that a physical iOS/Android device can connect; verify each device separately.

## Operations

```bash
docker compose --env-file .env.docker -f docker-compose.local.yml ps
docker compose --env-file .env.docker -f docker-compose.local.yml logs -f api
docker compose --env-file .env.docker -f docker-compose.local.yml down
```

To delete local database/cache data as well (destructive):

```bash
docker compose --env-file .env.docker -f docker-compose.local.yml down -v
```

## Important limitations

- This local stack does not start every specialized background worker, observability stack, object storage, email/SMS/payment provider, or production edge proxy. Those integrations require their own configuration and acceptance.
- Live provider dispatch/payment capture and other production-gated behavior must remain disabled until their separate security, legal and operational gates pass.
- Production builds remain blocked until the authentic pnpm 9.15.0 lockfile is committed and frozen install/build succeeds.
- Docker Compose config/build/up, migrations, API readiness, browser flows and mobile device acceptance must be run on a Docker-enabled host and retained as evidence.

## Demo data and role logins (P581)

After the stack is running, seed the local tenant:

```bash
docker compose --env-file .env.docker -f docker-compose.local.yml --profile seed run --rm seed-demo
```

The seeder creates 60 students, 60 guardians, 60 enrollments, 20 staff, 12 grades, 60 attendance sessions, 300 attendance rows, 60 fee charges and invoices, 60 exams, 60 homework assignments, 20 calendar events, 30 expenses and 30 communications. It creates 14 role logins. Default local-only password is `Demo@School2026!`; override with `DEMO_SEED_PASSWORD` in `.env.docker` before seeding.

See [`DEMO-DATA-TEST-RUNBOOK.md`](./DEMO-DATA-TEST-RUNBOOK.md) for every role credential, test walkthrough, exact commands and data coverage limitations. The seeder is opt-in and refuses to run unless `ALLOW_DEMO_SEED=true`.
