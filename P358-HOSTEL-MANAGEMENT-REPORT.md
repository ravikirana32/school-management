# P358 — Hostel Management

## Delivered source changes
- Added persistence models and SQL migration for hostel buildings, rooms, beds, student allocations, incidents and leave requests.
- Added school-scoped authenticated APIs for dashboard, building create/list, room creation with generated bed inventory, student bed allocation/list, checkout, incident create/list.
- Allocation checks available bed and updates bed state to OCCUPIED; checkout marks allocation checked out and releases bed.
- Seeded hostel read/manage and parent hostel permission keys; added Hostel Warden role; added hostel permissions to school Principal and HR role permissions.
- Added School Admin Hostel workspace for buildings, rooms/beds, resident allocation, checkout and incident log.

## Verification
- Static source verifier: 43/43 PASS (presence/structure checks only).
- ZIP integrity and cumulative preservation verified separately.
- Not run: Prisma validation/generation, migration apply, live API/database, typecheck/build, E2E, device tests, security/safeguarding/accessibility review.

## Open gaps
- Parent/student mobile hostel status, verified guardian permissions and leave request create/approval workflow.
- Hostel attendance/curfew roll-call, gate pass verification, visitor register, emergency response and incident escalation workflow.
- Bed occupancy concurrency/locking, room capacity reconciliation, student roster validation, allocation edits/transfers, room/bed maintenance state.
- Fee billing/ledger, deposit/refund/arrears, notification and communication templates, meal integration, staff schedules, reports/exports.
- Incident status/closure controls and audit trail, consent and safeguarding controls.
- Parent/warden mobile workflows and runtime verification.
