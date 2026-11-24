# P357 — Transport Management

## Delivered source changes
- Added Prisma persistence models for vehicles, routes, ordered stops, student allocations, trips and trip events, plus PostgreSQL migration.
- Added authenticated tenant/school scoped APIs: dashboard, vehicle list/create, route/stop create/list, student allocation/list, trip create/list/status transitions, pickup/dropoff/absence/incident events.
- Added vehicle capacity/status and documentation expiry fields; route creation validates active school-owned vehicle; allocations validate route/stop relationship; unique allocation per student and academic year.
- Seeded transport read/manage permissions and Transport Coordinator role; transport permissions added to school Principal and HR role grants. Parent transport permission key is seeded but parent route/mobile experience is not delivered in P357.
- Added School Admin Transport workspace for basic vehicle registration, route/stop creation, allocation to first available route/stop and read views for allocations/trips.

## Verification
- Static verifier: 45/45 source checks PASS (source text presence/structure only).
- ZIP overlay verification: completed in verification artifact.
- Not run: Prisma generate/validate, migration application, API runtime, tenant isolation runtime, TS typecheck, frontend build, unit/integration/E2E, mobile-device testing, accessibility, security review, database constraints in runtime.

## Known open gaps
- Parent/Student mobile route, assigned pickup stop, vehicle/driver, schedule and safety alerts; guardian linkage authorization.
- Staff driver/attendant mobile trip start/end, roster, stop-by-stop pickup/dropoff and incident reporting.
- Allocation edit/terminate, capacity enforcement and student roster validation; route assignment consistency and schedule collision checks.
- Trip-event checks must validate that stop belongs to trip's route and student belongs to allocation; current source validates school-scoped stop and trip only.
- Fee billing/ledger integration, notifications, route GPS/geofencing, live tracking, emergency/consent/retention, document expiry alerting, maintenance scheduling, exports and analytics.
- Permissions/role seed and migration require runtime verification; current UI route uses permissions to show menu, but exact role grants need runtime review.
