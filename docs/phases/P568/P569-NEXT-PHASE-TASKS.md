# P569 Next Phase Tasks — Hostel Capacity, Transfers, Waitlist & Checkout Settlement

Baseline: P568 cumulative. Roadmap source: `C2-10-ROADMAP.md`.

## Planned scope
- Capacity dashboard: active beds, occupied/reserved/available/maintenance/out-of-service beds, occupancy by building/room/hostel type.
- Bed/room transfer request and approval with effective timestamp, reason, from/to bed audit and atomic availability checks.
- Prevent transfer when destination bed is occupied, out of service or outside the student's hostel eligibility/type.
- Waitlist registration with priority, requested hostel type/building, academic year, eligibility and guardian contact consent.
- Waitlist ranking and offer lifecycle: WAITLISTED → OFFERED → ACCEPTED/DECLINED/EXPIRED; allocate a bed atomically on acceptance.
- Automatic waitlist offer when capacity becomes available, with idempotency and notification preferences.
- Resident checkout workflow with clearance checklist (keys, inventory, damage, dues, deposit), warden approval and final occupancy release.
- Settlement ledger for unpaid fees, prorated fee calculation, damage charges, refundable deposit, deductions and refund approval.
- Keep accounting postings separate from workflow status; use existing school accounting ledger where available.
- School Admin/warden workflows and Parent Mobile status visibility where appropriate.

## Preserve
- P358 building/room/bed/allocation and existing checkout behavior until P569 replacement is verified.
- P566 roll-call, curfew, night checks and safety escalations.
- P567 visitor and gate-pass flows.
- P568 guardian leave/consent/notification/late-return flows.

## Acceptance boundaries
- Tenant-safe transactions and composite ownership validation.
- Advisory locks or database constraints for allocation/transfer/waitlist races.
- Auditable actor, reason, before/after bed and settlement lines.
- Parent notification only with explicit guardian consent and configured channel preference.
- Migration/backfill compatibility for existing HostelAllocation and HostelBed records.
- Prisma/database/runtime, RLS, semantic build, mobile, accessibility, concurrency and E2E gaps must remain visible until tested.
