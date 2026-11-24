# School Management SaaS

White-label, multi-organization School Management SaaS with four web applications, five native mobile applications, a shared Node.js API, background workers, PostgreSQL and Redis.

## Canonical project documents

1. [Complete feature catalogue](SCHOOL-SaaS-FEATURE-CATALOG.md)
2. [Completed and upcoming roadmap](SCHOOL-SaaS-ROADMAP.md)
3. [Missed functionality backlog](MISSED-FUNCTIONALITY-BACKLOG.md)
4. [Feature-wise open gap matrix](SCHOOL-SaaS-FEATURE-GAPS.md)

These four documents are the canonical user-facing sources. Legacy `MASTER-*`, `FINAL-DETAILS-*` and `IMPLEMENTATION-STATUS.md` paths remain compatibility mirrors for historical scripts; use the four documents above for current project planning. Historical phase-specific reports and specialized security, API, deployment and operations documents are retained as evidence.

## Run the application with Docker (local development)

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker -f docker-compose.local.yml up --build
```

- School Admin: http://localhost:5173
- Organization Admin: http://localhost:5174
- Super Admin: http://localhost:5175
- Public Portal: http://localhost:5176
- API liveness: http://localhost:8080/health/live
- API readiness: http://localhost:8080/health/ready

Optional profiles:

```bash
# Background workers
docker compose --env-file .env.docker -f docker-compose.local.yml --profile workers up --build

# Native Expo/Metro app servers
docker compose --env-file .env.docker -f docker-compose.local.yml --profile mobile up --build
```

See [DOCKER-LOCAL-QUICKSTART.md](DOCKER-LOCAL-QUICKSTART.md) for prerequisites, logs, shutdown, data reset and limitations. This is a local development profile, not production deployment. Production builds remain gated on the authentic pnpm 9.15.0 lockfile and frozen install.

## Current release position

P580 consolidates project documentation and adds a local Docker runtime foundation. Docker build/start, PostgreSQL migrations, API/web/mobile runtime and end-to-end acceptance have not yet been executed in this authoring environment. The P579 production decision remains **NO-GO** until the outstanding runtime, security, privacy, accessibility, operational and independent-review gates are evidenced.


## Local demo environment (P581)

- [Docker local quick start](./DOCKER-LOCAL-QUICKSTART.md)
- [Demo data, role credentials and test runbook](./DEMO-DATA-TEST-RUNBOOK.md)
- Demo seed command: `docker compose --env-file .env.docker -f docker-compose.local.yml --profile seed run --rm seed-demo`
