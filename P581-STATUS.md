# P581 Status — Demo data and role-based walkthrough

**Baseline:** P580 cumulative. **Status:** Source implementation delivered; runtime acceptance pending.

## Delivered
- Added an explicit opt-in, idempotent Prisma demo seeder (`backend/api/prisma/demo-seed.ts`).
- Reuses the existing base seed for permission catalogue, system school roles and subscription plans.
- Creates demo organization/school, school profile, 12 grade levels, current academic year, 20 staff, 12 teacher assignments, 60 students, 60 guardians and guardian links, 60 enrollments, 60 attendance sessions with 300 attendance rows, 60 fee charges and invoices, 60 assessment exams, 60 homework assignments, 20 calendar events, 30 expenses and 30 communications.
- Creates 14 role login accounts with Argon2id password hashes and scoped role assignments, including API aliases `ORG_ADMIN`, `TEACHER` and `ACCOUNTANT`.
- Links parent demo account to one guardian/student only.
- Added Docker Compose seed profile, npm/pnpm commands, environment controls, test runbook and role credential list.
- Added P581 gap register entries and roadmap update.

## Static verification
- P581 verifier: 10/10 PASS.
- TypeScript transpile syntax diagnostics: 0.
- Root/API package JSON parse: PASS.
- Docker Compose YAML parse: PASS.

## Not run / not claimed
- Docker CLI is unavailable in this authoring environment.
- No pnpm installation or Prisma client generation was executed.
- No PostgreSQL migrations or seeder database execution were run.
- No actual row counts, login flows, role permissions, tenant isolation, API/browser/mobile E2E or page visibility have been runtime verified.

**Release position:** Developer preview only. Demo credentials are local-only. P581 adds no production approval and closes no runtime gap.
