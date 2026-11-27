# School Management SaaS

## Documentation

- [Consolidated documentation entry point](SCHOOL-MANAGEMENT-SAAS-CONSOLIDATED-DOCUMENTATION.md)
- [Master functionality, gaps and end-to-end roadmap](SCHOOL-MANAGEMENT-SAAS-MASTER-FUNCTIONALITY-ROADMAP.md)

White-label, multi-organization School Management SaaS with four web applications, five native mobile applications, a shared Node.js API, background workers, PostgreSQL and Redis.

## Canonical project documents

1. [Master functionality, gap register and delivery roadmap](SCHOOL-MANAGEMENT-SAAS-MASTER-FUNCTIONALITY-ROADMAP.md) — current product/status baseline and phase sequence
2. [Complete feature catalogue](SCHOOL-SaaS-FEATURE-CATALOG.md) — detailed source inventory; reconcile its older baseline against current code
3. [Feature-wise open gap matrix](SCHOOL-SaaS-FEATURE-GAPS.md) — phase IDs and historical acceptance tasks; counts include verification/governance work
4. [Older roadmap](SCHOOL-SaaS-ROADMAP.md) and [missed functionality backlog](MISSED-FUNCTIONALITY-BACKLOG.md) — discovery and historical planning evidence, not current status authorities

Legacy `MASTER-*`, `FINAL-DETAILS-*` and `IMPLEMENTATION-STATUS.md` paths remain compatibility mirrors for historical scripts. Historical phase-specific reports and specialized security, API, deployment and operations documents are retained as evidence.

## Run the application with Docker (local development)

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker -f docker-compose.local.yml up --build
```

- School Admin: http://localhost:15173
- Organization Admin: http://localhost:15174
- Super Admin: http://localhost:15175
- Public Portal: http://localhost:15176
- API liveness: http://localhost:18080/health/live
- API readiness: http://localhost:18080/health/ready

Optional profiles:

```bash
# Background workers
docker compose --env-file .env.docker -f docker-compose.local.yml --profile workers up --build

# Native Expo/Metro app servers
docker compose --env-file .env.docker -f docker-compose.local.yml --profile mobile up --build
```

See [DOCKER-LOCAL-QUICKSTART.md](DOCKER-LOCAL-QUICKSTART.md) for prerequisites, logs, shutdown, data reset and limitations. This is a local development profile, not production deployment. Production builds remain gated on the authentic pnpm 9.15.0 lockfile and frozen install.

## Current release position

The local Docker web apps and API liveness/readiness endpoints responded during the 2026-11-27 audit. This is a local service smoke check only; it does not close database migration, role-based journey, security, mobile-device, provider, accessibility, disaster-recovery or production acceptance. The P579 production decision remains **NO-GO** until the outstanding gates are evidenced. See the [master functionality roadmap](SCHOOL-MANAGEMENT-SAAS-MASTER-FUNCTIONALITY-ROADMAP.md).


## Local demo environment (P581)

- [Docker local quick start](./DOCKER-LOCAL-QUICKSTART.md)
- [Demo data, role credentials and test runbook](./DEMO-DATA-TEST-RUNBOOK.md)
- Demo seed command: `docker compose --env-file .env.docker -f docker-compose.local.yml --profile seed run --rm seed-demo`
