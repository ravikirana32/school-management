# P570 Next Phase Tasks — Hostel Fees, Deposits, Duty Roster, Maintenance & Safeguarding

Baseline: P569 cumulative. Roadmap source: `C2-10-ROADMAP.md`.

## Planned scope
- Hostel fee plans by hostel type/building/room category and academic year; monthly, term and annual billing schedules.
- Effective-dated fee changes, concessions/waivers with approval, late-fee policy and invoice generation.
- Prorated charges for mid-period admission, transfer, leave where policy permits, and checkout; transparent calculation breakdown.
- Security deposit collection, allocation, balance tracking, deductions and refund request/approval lifecycle.
- Payment recording, receipts, outstanding balance and reconciliation using existing school fee/accounting infrastructure where compatible; no duplicate ledger.
- Parent Mobile fee/deposit visibility and payment status; provider checkout only where an existing supported gateway contract is available.
- Warden and hostel staff duty roster: shifts, assignments, coverage, handover notes, leave/absence and conflict prevention.
- Maintenance issue reporting, priority/SLA, work orders, technician/vendor assignment, parts/costs, approval and closure evidence.
- Room/bed maintenance state changes with safeguards against taking occupied beds out of service; restore capacity only after approved closure.
- Confidential safeguarding case intake, severity, restricted case access, response plan, assigned owner, escalation and closure review.
- Operational reports: occupancy/utilization, fees/arrears/deposits, maintenance backlog, duty coverage, incidents/safeguarding and audit exports.
- Tenant-scoped permissions, audit events, retention/privacy controls, accessibility and School Admin/Parent Mobile workflows.

## Preserve
- P358 hostel inventory/allocation foundation.
- P566 roll-call, curfew, night checks and safety escalations.
- P567 visitor and gate-pass lifecycle.
- P568 leave, guardian consent/notification and return check-in.
- P569 capacity, transfers, waitlist offers, checkout clearance and settlement approvals.

## Acceptance boundaries
- Use the existing accounting/payment domain when feasible; do not create parallel balances that diverge from school accounting.
- Fee calculation must be deterministic, effective-dated, explainable and testable across partial periods, fee changes and reversals.
- Financial postings must be immutable/auditable; refund requests and refund execution are distinct states.
- Duty roster and maintenance operations must prevent double-booking and unsafe bed-capacity changes.
- Safeguarding records require least-privilege access, sensitive-field minimization and access audit.
- Prisma/database/runtime, RLS, semantic builds, payment/provider, accessibility, concurrency, load and E2E gaps remain visible until tested.
