# P581 Demo Data & Role Credentials Runbook

## Safety
This dataset is fictional and for local development only. Do not use these credentials in production or expose the demo database to the internet. The seeder refuses to run unless `ALLOW_DEMO_SEED=true`. Set `DEMO_SEED_PASSWORD` before seeding to override the documented local default. Use a disposable database.

## Start the complete local web stack
From the repository root:

```bash
cp .env.docker.example .env.docker
# Edit .env.docker and set a private local DEMO_SEED_PASSWORD.
docker compose --env-file .env.docker -f docker-compose.local.yml up --build -d
```

The `migrate` service runs `prisma migrate deploy` before the API starts.

## Seed demo data
Run the opt-in seed profile:

```bash
docker compose --env-file .env.docker -f docker-compose.local.yml --profile seed run --rm seed-demo
```

This runs the existing base seed (plans, permissions and school roles) followed by the P581 demo dataset. It is designed to be re-runnable/upsert-based; it does not wipe unrelated tenant data.

Alternatively, from a host with Node 22, pnpm 9.15.0 and dependencies installed:

```bash
ALLOW_DEMO_SEED=true DEMO_SEED_PASSWORD='YourLocalDemoPassword!' \
  DATABASE_URL='postgresql://school_saas:school_saas_local_only_change_me@localhost:5432/school_saas?schema=public' \
  pnpm db:seed:demo
```

## Demo login credentials
All accounts below use the same local-only password: `Demo@School2026!` unless you override `DEMO_SEED_PASSWORD` before seeding. The password is hashed using Argon2id. Use the same overridden password for every account.

| Role | Login email |
|---|---|
| Platform Administrator | `superadmin@school.demo` |
| Organization Administrator | `orgadmin@school.demo` |
| School Administrator | `schooladmin@school.demo` |
| Principal | `principal@school.demo` |
| Teacher | `teacher@school.demo` |
| Front Office | `frontoffice@school.demo` |
| Finance Officer | `finance@school.demo` |
| HR Manager | `hr@school.demo` |
| Librarian | `librarian@school.demo` |
| Transport Coordinator | `transport@school.demo` |
| Hostel Warden | `warden@school.demo` |
| Canteen Staff | `canteen@school.demo` |
| Department Head | `hod@school.demo` |
| Parent / Guardian | `parent@school.demo` |

Demo tenant: **Green Valley Education Group** (`demo-green-valley`), school **Green Valley International School** (`GVIS`), CBSE, Bengaluru. The parent demo account is linked to the first demo guardian/student record. Other guardians are contact-only records unless separately linked by an application workflow.

## Seeded records
The seeder creates or updates:

| Area / table | Expected demo rows |
|---|---:|
| Students | 60 |
| Guardians | 60 |
| Student-guardian links | 60 |
| Current academic-year enrollments | 60 |
| Staff members | 20 |
| Grade levels | 12 |
| Attendance sessions | 60 (12 grades × 5 dates) |
| Student attendance rows | 300 |
| Student fee charges | 60 |
| Fee invoices and invoice lines | 60 each |
| Teacher assignments | 12 |
| Assessment exams | 60 |
| Homework assignments | 60 |
| Calendar events | 20 |
| School expenses | 30 |
| School communications | 30 |
| Role demo accounts | 14 |

Records are marked with `[P581-DEMO]` in notes/descriptions where the model supports it, or use `DEMO-`/`GV2026` business identifiers. They are fictional; fees/expenses do not initiate real collection or payment.

## URLs
- School Admin: http://localhost:5173
- Organization Admin: http://localhost:5174
- Super Admin: http://localhost:5175
- Public Portal: http://localhost:5176
- API liveness: http://localhost:8080/health/live
- API readiness: http://localhost:8080/health/ready

## Suggested role-based walkthrough
1. Sign in as Super Admin; inspect platform organizations and school setup.
2. Sign in as Organization Admin; inspect organization/school scope.
3. Sign in as School Admin; inspect students, staff, grade levels, academic year, attendance, fee charges, exams, homework, calendar, expenses and communications.
4. Sign in as Principal; review operational/approval dashboards and notices.
5. Sign in as Teacher; inspect class/attendance/assessment/homework views.
6. Sign in as Finance Officer; inspect student fee charges and expense examples. No real payment gateway is enabled.
7. Sign in as Parent; inspect the linked demo student's portal data. The parent is linked to one student, not all 60.

## Reset local demo database
**Destructive:** this removes the local PostgreSQL and Redis volumes, including any local data.

```bash
docker compose --env-file .env.docker -f docker-compose.local.yml down -v
docker compose --env-file .env.docker -f docker-compose.local.yml up --build -d
docker compose --env-file .env.docker -f docker-compose.local.yml --profile seed run --rm seed-demo
```

## Important coverage limitation
This is a substantial cross-module starter dataset, not a guarantee that every page in all 14 application roles has records. Some modules require provider sandbox events, consent evidence, uploaded documents, payroll cycles, library circulation, transport routes/GPS, hostel occupancy, canteen inventory, payment/refund ledgers or operational workflows. Those should be seeded in dedicated module-specific phases with valid state transitions; do not create fake provider callbacks, approvals, payment settlements or safeguarding evidence just to populate a screen.
