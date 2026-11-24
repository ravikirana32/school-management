# P570 Status — Hostel Finance, Deposits, Duty Roster, Maintenance & Safeguarding

**Baseline:** P569 cumulative. **Status:** Source implementation complete; production/runtime acceptance remains open.

## Implemented
- Tenant-scoped fee plans with academic year, hostel type/building/room category, billing frequency metadata, effective dates, late-fee configuration fields.
- Hostel invoice issuance against an active allocation and applicable plan, calendar-day proration across allocation admission/checkout boundaries, concession bounds, persisted calculation breakdown and unique invoice number.
- Append-only payment records, outstanding-balance checks, advisory-lock serialization and invoice paid/partially-paid state.
- Security deposit account and immutable event ledger; collection, deductions, refund request, separate approval and execution; pending/approved refunds reserve balance and deductions cannot consume reserved funds.
- Duty roster with building assignment, shift time validation and overlap prevention for the same staff user.
- Maintenance ticket intake, priority/SLA metadata, technician assignment, cost/parts metadata, evidence-based closure and automatic bed maintenance state protection/restoration. Occupied/reserved beds cannot be taken out of service.
- Restricted safeguarding case intake, separate read/manage permissions, limited summary list, restricted details, response plan/review/closure and access audit.
- Parent portal fee summary and Parent Mobile invoice/payment status visibility for verified linked guardians with communication access.
- School Admin workflows for fee plans/invoices, duty assignments and maintenance tickets.

## Deliberate boundaries
- No payment gateway/provider checkout, bank reconciliation or automated payment settlement is claimed.
- Fee schedule generation, billing frequency orchestration and late-fee application are not automated; fee plan fields and manual invoice issue are foundations.
- The hostel fee ledger is not yet posted into the school's canonical accounting journal. Avoid treating this as reconciled general-ledger accounting.
- Parent Mobile is read-only for hostel invoices/payment status; no payment initiation.
- Safeguarding case access is permission-gated and audited, but a complete field-level privacy/retention/legal review is still required.
- Duty coverage analytics, SLA timers, vendor/parts procurement and report exports remain open.

## Verification
- P570 focused source verifier: 57/57 PASS.
- P569 regression: 49/49 PASS.
- P568 regression: 72/72 PASS.
- P567 regression: 57/57 PASS.
- P566 regression: 44/44 PASS.
- P358 regression: 43/43 PASS.
- Four changed TypeScript/TSX files transpile with 0 syntax diagnostics.
- Prisma CLI format/validate/generate, PostgreSQL clean/upgraded migration execution, semantic typecheck/build, DB/API integration, production RLS, provider payment E2E, browser/device/accessibility, concurrency/load and full E2E were not run.
