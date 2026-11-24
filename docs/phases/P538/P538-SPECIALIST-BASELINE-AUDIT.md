# P538 — Specialist Foundation Audit & Cycle Plan

## Baseline
- Input: P537 cumulative archive.
- Cycle: C2-10 Specialist Operations (F19–F23).
- Existing specialist Admin workspaces found: Health, Canteen, Library, Transport, Hostel.
- Existing API route modules found: health, canteen, library, transport, hostel.
- Existing mobile specialist journey foundation detected in Parent Mobile.
- Detailed implementation is partial and must be audited/advanced phase-by-phase; workspace presence alone is not completion evidence.

## Findings by feature

### F19 Health & wellbeing (roadmap baseline: 40%)
Found profile/event and restricted workspace foundations. Remaining work includes field-scoped roles, consent/guardian visibility, emergency/allergy/condition/medication safety, authorized case workflow, incident triage/follow-up/escalation, audit, mobile integration, reports and security/runtime checks.

### F20 Canteen & meals (roadmap baseline: 55%)
Found menu, meal-plan, allocation, order/payment/serve and stock foundations with Admin and user-facing panels. Remaining work includes recipes/ingredients, stock consumption ledger, purchasing/receiving/lot/expiry, preorder/cancel/refund, wallet/payment reconciliation, production/wastage, allergen safety, staff operations, analytics and validation.

### F21 Library (roadmap baseline: 35%)
Found catalogue/copy/accession/shelf, issue/return, loan and reservation foundations. Remaining work includes barcode/QR and bulk import, policy/rules, queue/hold/cancel/expiry, renewal/fines, lost/damaged lifecycle, mobile catalogue/reservation, overdue notifications, reports and audit.

### F22 Transport (roadmap baseline: 30%)
Found vehicle, route, stop, student allocation and trip/event foundations. Remaining work includes driver/attendant, capacity/conflict-safe allocation, pickup/drop safety and handover, GPS provider integration and consent/retention, parent tracking/geofence/notifications, incident/maintenance/expiry alerts, fees, analytics and device validation.

### F23 Hostel (roadmap baseline: 30%)
Found building/room/bed, occupancy/allocation/checkout and incident foundations. Remaining work includes roll-call/curfew/night-check, visitors/gate passes, leave/guardian flows, concurrency-safe capacity/transfer/waitlist/checkout, fees/deposits/refunds, duty roster, maintenance, safeguarding, reports, notifications, permissions and mobile.

## P538 output
- Created the C2-10 roadmap with phases P538–P570 (33 phases).
- Established detailed phase scope and module-specific acceptance direction.
- Added C2-10 foundation gaps to the master register.
- This is a planning/audit phase; it does not assert feature implementation or runtime verification.
