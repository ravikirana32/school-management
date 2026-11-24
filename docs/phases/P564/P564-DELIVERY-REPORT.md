# P564 Delivery Report — Transport Incidents, Emergency Response, Maintenance & Document Expiry

## Delivered
- Tenant/school-scoped transport incident records with categories ACCIDENT, BREAKDOWN, SAFETY, MEDICAL, BEHAVIOUR and OTHER; severity LOW/MEDIUM/HIGH/CRITICAL; lifecycle OPEN, ACKNOWLEDGED, IN_PROGRESS, RESOLVED and CLOSED.
- Incident creation validates optional vehicle/trip references against the active school. Admin lifecycle endpoint records resolution notes and resolution time.
- Emergency contact contacted flag/name captured at report time.
- Vehicle maintenance schedule and history with service/repair/inspection/tyre/other categories, vendor, cost, odometer, scheduled date, next due date and lifecycle.
- Vehicle inspection records with PASS/DEFECT/FAIL, defect notes, odometer and follow-up due date.
- Compliance expiry report combines vehicle insurance/permit/fitness, driver license, personnel document expiry and due maintenance within a bounded 0–180 day window.
- School Admin Transport Workspace: incident reporting and acknowledgement/resolution, maintenance scheduling/completion, compliance expiry summary.
- Driver Mobile: incident report submission with category and severity.
- Prisma schema and SQL migration for three new tables.

## API
- GET/POST `/:organizationId/:schoolId/transport/incidents`
- POST `/:organizationId/:schoolId/transport/driver/mobile/incidents` (verified assigned driver intake)
- PATCH `/:organizationId/:schoolId/transport/incidents/:incidentId`
- GET/POST `/:organizationId/:schoolId/transport/maintenance`
- PATCH `/:organizationId/:schoolId/transport/maintenance/:maintenanceId`
- POST `/:organizationId/:schoolId/transport/vehicles/:vehicleId/inspections`
- GET `/:organizationId/:schoolId/transport/compliance/expiry-report?daysAhead=30`

All management mutations require `transport.manage`; reads use existing transport read scope. Queries are tenant/school scoped.

## Verification
- P564 focused source/migration verifier: 25/25 PASS.
- P562 GPS regression: 19/19 PASS.
- P561 attendance regression: 16/16 PASS.
- P560 capacity regression: 17/17 PASS (run from repository root).
- TypeScript/TSX transpilation: transport API, School Admin Transport Workspace and Driver Mobile: 0 diagnostics.
- Not run: Prisma CLI validation/generation, live DB migration, dependency-backed full build/typecheck, API runtime, device/browser interaction, notification provider delivery, accessibility, concurrency and E2E.

## Known open gaps
- Emergency contact directory and automatic call/SMS/push escalation are not integrated; report captures contact escalation metadata only.
- Incident evidence attachments, photo/video upload and guardian notification are pending.
- Maintenance vendor/invoice attachment and cost ledger integration are pending.
- Inspection checklists, defect-to-vehicle immobilization automation and approval workflow are pending.
- Scheduled expiry/maintenance reminder worker is not wired; expiry report is on-demand.
- Full runtime/database/build/device/security/accessibility/concurrency/E2E acceptance remains pending.

## Cumulative release
Built from verified P563 cumulative baseline. Archive manifest, SHA-256 checksum and archive verification report are included in the cumulative ZIP.
