# P581 Test Report

| Test | Result | Evidence / limitation |
|---|---|---|
| P581 static demo-seed verifier | PASS 10/10 | `P581-DEMO-SEED-VERIFICATION.json` |
| TypeScript syntax transpilation | PASS | 0 syntax diagnostics for `backend/api/prisma/demo-seed.ts`; not a semantic typecheck |
| Root package JSON | PASS | Parsed with Node/Python JSON parser |
| API package JSON | PASS | Parsed with Node/Python JSON parser |
| Docker Compose YAML | PASS | Parsed with PyYAML |
| Prisma schema validation/client generation | NOT RUN | pnpm/dependencies unavailable |
| Frozen dependency install | NOT RUN | Authentic lockfile/toolchain unavailable |
| Docker image build/Compose startup | NOT RUN | Docker CLI unavailable |
| PostgreSQL migration deployment | NOT RUN | No Docker/PostgreSQL runtime |
| Demo seeder execution and row counts | NOT RUN | No database runtime |
| Repeated seeder idempotency | NOT RUN | No database runtime |
| 14 role logins and authorization | NOT RUN | No running API/database |
| Browser/mobile page visibility | NOT RUN | No running stack/devices |

Static checks establish source/config syntax only. They do not establish that Prisma accepts every create/update payload or that all target pages display the seeded data. Execute the Docker runbook on a Docker-enabled host and retain logs before closing P581 gaps.
