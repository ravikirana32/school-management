# P280 Status — Communication Center

Implemented the school announcement draft/publish center in the cumulative P279 baseline.

## Delivered
- SchoolCommunication data model and SQL migration with tenant RLS/FORCE RLS.
- Communication listing API, school-scoped draft creation and publish endpoint.
- Audience selection: ALL, PARENTS, TEACHERS, STUDENTS, STAFF.
- Priority: LOW, NORMAL, HIGH.
- Draft and published lifecycle, publication timestamp and publisher identity.
- Audit events for draft creation and publishing.
- Granular communications.read/manage permissions and seed grants.
- School Admin Communication Center tab with compose, save draft, preview listing and publish confirmation.

## Boundary
- P280 publication lifecycle was extended in P281 with recipient resolution and basic in-app fan-out. Email/push and portal inbox UI remain future gaps.

## Verification
- Modified TypeScript/TSX syntax transpilation passed.
- Static checks added for model, tenant RLS, API lifecycle, audience options and tab integration.
- ZIP integrity and checksum verified.
- Full schema generation/migration/API/browser/mobile runtime tests not run (dependencies unavailable).

## Open gaps
- P280-VAL01: Execute Prisma validation/migration and API/UI runtime acceptance in a dependency-equipped environment.
- P280-G001: Recipient resolution and basic in-app fan-out were delivered in P281; email/push delivery remains open.
- P280-G002: Draft edit/delete, scheduled publication, attachments and delivery receipt/read tracking.
