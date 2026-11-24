# P581 Delivery Report

## Summary
P581 adds local demo data and role-based credentials to the P580 cumulative School Management SaaS baseline. It also wires an opt-in Docker Compose seed service and documents a role-by-role testing walkthrough.

## Demo data contract
Tenant: Green Valley Education Group (`demo-green-valley`). School: Green Valley International School (`GVIS`), CBSE, Bengaluru.

Expected records: 60 students; 60 guardians; 60 student-guardian links; 60 enrollments; 20 staff; 12 grades; 60 attendance sessions; 300 attendance rows; 60 fee charges; 60 exams; 60 homework assignments; 20 calendar events; 30 expenses; 30 communications; 14 demo role accounts.

## Demo role accounts
`superadmin@school.demo`, `orgadmin@school.demo`, `schooladmin@school.demo`, `principal@school.demo`, `teacher@school.demo`, `frontoffice@school.demo`, `finance@school.demo`, `hr@school.demo`, `librarian@school.demo`, `transport@school.demo`, `warden@school.demo`, `canteen@school.demo`, `hod@school.demo`, `parent@school.demo`.

Local default password: `Demo@School2026!`; override via `DEMO_SEED_PASSWORD` before seeding. Passwords are hashed with Argon2id. Do not use these accounts in production.

## Commands
```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker -f docker-compose.local.yml up --build -d
docker compose --env-file .env.docker -f docker-compose.local.yml --profile seed run --rm seed-demo
```

Full instructions: `DEMO-DATA-TEST-RUNBOOK.md`.

## Verification
P581 static verifier 10/10 PASS; TypeScript syntax transpilation 0 diagnostics; package JSON and Compose YAML parse PASS. Docker build, migrations, PostgreSQL seeder execution, actual record counts, login and E2E are NOT RUN in this environment.

## Open items
P581-G001–G008 remain open. Existing P580 open gaps are carried forward. The demo data is not claimed to cover every page/module; provider callbacks, real payment settlements, safeguarding evidence and other workflow-specific records are intentionally not fabricated.
