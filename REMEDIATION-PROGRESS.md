# Remediation progress through P99

Phases delivered: P80–P99 (20 phases).

Current work is policy and API source foundation. End-to-end acceptance across DB/RLS, API, browser/mobile, workers and external providers is not yet complete. Refer to MASTER-OPEN-GAPS-REGISTER.md for authoritative unresolved status.

## P165–P172 closure block

Alert taxonomy and dedupe contracts added; document-scan terminal failures and refund-evidence cleanup failures emit durable operations alerts. Operations/storage/evidence remaining gaps are carried in the master register. Runtime acceptance remains pending.

## Finance Cycle C2-08 latest: P515
P515 delivers invoice-aware manual payment collection, enabled payment-method configuration enforcement, matching-reference idempotency, invoice net outstanding caps, immutable payment-to-installment allocation records, installment/schedule balance and status updates, and Finance UI allocation/invoice details. P515 focused source verification passed 45 checks and P509–P514 regressions passed. Runtime acceptance remains pending. See `docs/phases/P515/` and `MASTER-OPEN-GAPS-REGISTER.md.

## Finance Cycle C2-08 latest: P516
P516 adds formal immutable fee receipts with school-scoped sequence numbering, idempotent issue API, tenant-scoped receipt list/detail endpoints, receipt snapshot/print UI, and student ledger API/UI for charges, approved concessions, payments and settled refunds with per-currency running balances. P516 focused verifier passed 69 checks; P510–P515 finance regressions passed; modified TS/TSX parser diagnostics are 0. Runtime acceptance remains pending. See `docs/phases/P516/` and the master gap register.


## Finance Cycle C2-08 latest: P517
P517 delivers tenant-scoped outstanding fee balances and aging buckets, currency totals, configurable school late-fee policy and fixed/percentage preview with grace days and optional cap, plus Finance UI. Policy defaults disabled; late fees are preview only, with no auto assessment or posting. Focused verifier 58/58; P513, P514, P515 regression verifiers passed (27/27, 43/43, 45/45); TS/TSX parser diagnostics zero. Live DB/API, tenant/RBAC negative acceptance, full build/typecheck and browser/device E2E remain pending. See docs/phases/P517 and gap register.


## Finance Cycle C2-08 latest: P518
P518 delivers currency-wise refund state/reserve summary, payment-level over-reserved refund detection, and Finance UI exception display. Verifier 25/25; P510–P518 regressions passed; parser diagnostics zero. Runtime acceptance pending. See docs/phases/P518 and master gap register.

## Finance Cycle C2-08 latest: P519
P519 integrates parent-visible finance data with installment schedules, formal receipt snapshots and payment-to-installment allocation details in the parent mobile app. Existing consent/guardian link/tenant scopes and read-only payment initiation behavior are preserved. Focused verifier 29/29 PASS; all P510–P519 focused finance verifiers passed; modified parent route and App.tsx parser diagnostics zero. Runtime database, build/typecheck and browser/mobile E2E acceptance remain pending. See docs/phases/P519 and MASTER-OPEN-GAPS-REGISTER.md.


## Finance Cycle C2-08 latest: P520
P520 adds an operational Finance consolidation overview to the Finance & Accounting workspace, grouping loaded billed, approved concessions, recorded paid, estimated outstanding and refund lifecycle totals by currency; it also shows invoice/refund/overdue counts, payment-method count, late-fee preview state and clearing-reconciliation context. Focused verifier 24/24 PASS; P510–P520 regression sequence PASS; TSX parser diagnostics 0. Totals are bounded-data estimates and not authoritative ledger reconciliation. Runtime/build/browser/mobile/E2E acceptance remains pending. See docs/phases/P520 and MASTER-OPEN-GAPS-REGISTER.md.


### P521 — Finance server-side aggregation remediation
- Added `/accounting/finance-summary` with tenant-school scoped server grouping for charges, concessions, invoices, payments, and refunds by currency/status.
- Added P521 server summary panel and aggregated CSV export.
- Focused source verifier and P510–P520 regression sequence executed; runtime database/build/E2E acceptance remains OPEN.

### P522 — Finance Ledger Reconciliation
- Added tenant-school scoped read-only payment/refund source-to-clearing-ledger reconciliation by currency.
- Comparison uses account 1110 cash/bank clearing conventions: payment clearing debit and refund clearing credit; non-1110 lines are excluded from the comparison totals.
- UI exposes source totals, posted journal totals, variances and categorized exceptions. No journal posting/mutation is performed.
- Focused verifier: 19/19 PASS. Finance regressions P510–P521 PASS. Parser diagnostics 0 for changed TS/TSX files. Runtime/DB/build/browser/E2E acceptance remains open.


### P523 — Finance Reconciliation Date Windows & Drill-down
- Added validated inclusive start/end dates to the reconciliation API. Source payment dates use `paidAt`, settled refunds use `settledAt`, and posted journal rows use `postingDate`; invalid dates and reversed ranges are rejected. Date differences can still produce timing variances and are explicitly explained in the UI.
- Added capped source detail: up to 100 payment rows, 100 settled refunds, and 200 posted journal lines with IDs, references, dates, account codes, debit/credit amounts.
- Finance Workspace date filters and drill-down tables are wired.
- Focused verifier 16/16 PASS; P522 verifier 19/19 PASS; P521 verifier 33/33 PASS; P510–P520 regression sequence PASS; TypeScript/TSX parser diagnostics 0. Runtime PostgreSQL/build/typecheck/browser/mobile/E2E remains OPEN.


## P524 Finance Lifecycle Status Matrix
P524 added payment/refund lifecycle counts and amount aggregation by currency/status and a diagnostic Finance Workspace view. Runtime acceptance remains open.

## Cycle progress snapshot (P524)
- **C2-08 Finance & Fee Management:** 12/12 planned phases complete (P509–P520); finance follow-up remediation P521 onward is separately tracked.
- **C2-09 Admissions, Documents & Communications:** 0/12 planned phases (P526–P537), after P525 remediation close-out.

## P525 — Finance Lifecycle Fixture Matrix & Remediation Close-out
- Added a 12-scenario finance lifecycle fixture specification and focused source verifier.
- P525 14/14; P524 13/13; P523 16/16; P522 19/19; P521 33/33 — **95/95 combined PASS**.
- Runtime database fixtures and broader acceptance remain OPEN; this is source/specification close-out only.

### Cycle snapshot (P525)
- C2-08 Finance & Fee Management: **12/12 planned complete** (P509–P520); remediation P521–P525 separate.
- C2-09 Admissions, Documents & Communications: **0/12 planned** (P526–P537).
- Next: P526 Admissions Foundation & Configuration.

## P526 / Cycle 2 progress update
- Finance & Fee Management C2-08 original phases: **12/12 complete**.
- Finance remediation phases P521–P525 source/specification work completed; runtime validation remains open.
- C2-09 Admissions, Documents & Communications planned P526–P537: **1/12 complete**.
- P526 Admissions Foundation & Configuration: source implementation complete; **18/18 focused assertions passed**.
- Next phase: P527 Applicant Intake API & Forms.

## P527 — Applicant Intake API & Forms
- Added versioned public intake metadata (`1.0`) for enquiry and application fields and a school-context validated `/admissions/intake-form` endpoint.
- Public portal consumes metadata and shows required/optional field summaries. Existing public application and draft routes preserved.
- Focused verifier P527 20/20; regressions P526 18/18, P525 14/14, P524 13/13, P522 19/19 — **84/84 PASS**.
- C2-08 Finance: 12/12 complete. C2-09 Admissions: **3/12 complete (P526–P528)**. Next P529.
- Runtime database/build/typecheck/browser/mobile/E2E validation remains OPEN.

## P528 — Application Status Transitions & Audit
- Transition preflight API added with current status, allowed transition options, terminal-state marker and recent stage history; common blockers return stable codes/context.
- P528 verifier: **21/21 PASS**. Admissions regressions P527/P526: **38/38 PASS**. Finance regressions P525–P520: **119/119 PASS**. Combined selected assertions: **178/178 PASS**.
- C2-08 Finance remains **12/12 complete**. C2-09 Admissions is **3/12 complete (P526–P528)**. Next P529.
- Runtime, tenant-negative, full build/typecheck, browser/mobile and E2E validation remain open.

## P529 Update

P529 — Admissions Document Checklist & Rule Resolution: source implementation delivered; focused verifier 22/22 PASS and P528 regression 21/21 PASS. Runtime/build/UI/E2E validation remains open.

## P530 P530 admissions secure-upload progress
- Completed source implementation and focused verification (25/25 assertions).
- C2-09 admissions/document/communications progress: 5/12 phases complete (P526–P530).
- Next phase: P531. Runtime/build/E2E remain pending.
