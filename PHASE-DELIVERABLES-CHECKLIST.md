# Mandatory Phase Deliverables Checklist
Every completed phase must include these deliverables in the cumulative archive, at root and mirrored under `docs/phases/P###/` where applicable:
- [ ] Delivery report (`P###-DELIVERY-REPORT.md`)
- [ ] Status report (`P###-STATUS.md`)
- [ ] Test report (`P###-TEST-REPORT.md`)
- [ ] ZIP verification (`P###-ZIP-VERIFICATION.txt`)
- [ ] Archive manifest (`P###-ARCHIVE-MANIFEST.json`)
- [ ] Static assertions with complete regression output (`P###-STATIC-ASSERTIONS.txt`)
- [ ] P490 verifier source retained (`verify-p490-student-cycle-closure.mjs`)
- [ ] Root/docs/master gap-register mirrors identical
- [ ] Cumulative archive CRC, baseline preservation, duplicate-entry, SHA-256 checks
- [ ] Do not claim runtime/build/device checks unless actually executed


## P501 deliverables
- [x] Delivery report
- [x] Status report
- [x] Test report
- [x] ZIP verification
- [x] Archive manifest
- [x] Static assertions with full regression output
- [x] P490 verifier source retained
- [x] Gap register mirrors synchronized

## P502 deliverables
- [x] Delivery report
- [x] Status report
- [x] Test report
- [x] ZIP verification
- [x] Archive manifest
- [x] Static assertions with full output
- [x] P490 verifier source retained
- [x] Gap register mirrors synchronized
- [x] Two confirmed source syntax blockers remediated and targeted parser-validated
- [ ] Full typecheck/build and runtime acceptance — blocked by dependency provisioning

## P514 — School Fee Billing & Invoice Lifecycle
- [x] Cumulative baseline P513 preserved
- [x] School fee invoice draft creation from published fee charges
- [x] Invoice list/detail APIs and tenant scope
- [x] Approved concession snapshots and integer-cent calculations
- [x] Installment-aware invoice item lines
- [x] Issue and reason-required void lifecycle
- [x] Finance UI create/issue/void controls
- [x] Focused verifier and P509–P513 verifier reruns
- [x] Gap-register mirror synchronization
- [x] Reports, manifest, archive verification and checksum
- [ ] User-local runtime/build/database/mobile/E2E acceptance

## P515 — Fee Collection & Payment Processing
- [x] Cumulative baseline P514 preserved
- [x] Invoice-linked manual payment recording
- [x] Invoice net outstanding payment cap and payable-state checks
- [x] Configured enabled payment method enforcement
- [x] Safe same-reference retry/idempotency and mismatch conflict
- [x] Payment-to-invoice linkage
- [x] Immutable payment-to-installment allocation table and tenant RLS
- [x] Oldest-installment-first partial/multi-installment allocation
- [x] Concession-aware installment target amounts
- [x] Reconcile pre-P515 payment balances into installments without inventing historical slices
- [x] Invoice/charge/installment/schedule paid balances/status updates
- [x] Finance UI configured payment methods, invoice outstanding cap, invoice/allocation payment history and receipt invoice identifier
- [x] P515 focused verifier (45 checks) and P509–P514 regressions
- [x] Gap register mirrors synchronized
- [x] Reports, manifest, archive verification and checksum
- [ ] Local runtime/database/build/mobile/E2E acceptance

## P516 — Receipts & Student Ledger
- [x] Cumulative baseline P515 preserved
- [x] Formal immutable receipt snapshot model and tenant-scoped receipt sequence counter
- [x] Idempotent formal receipt issue API with permission checks and audit event
- [x] Receipt list/detail API tenant scoping
- [x] School-config prefix read with safe fallback
- [x] Installment allocation and invoice reference included in receipt snapshot
- [x] Finance UI numbered receipt issue/print action
- [x] Student ledger API: charge, approved concession, payment, settled refund events
- [x] Per-currency running balance using minor-unit arithmetic
- [x] Finance UI student ledger search and debit/credit/running balance display
- [x] Focused verifier (69/69) and P510–P515 finance regressions
- [x] Gap register mirrors synchronized
- [x] Reports, manifest, archive verification and checksum
- [ ] Local runtime/database/build/mobile/E2E acceptance


## P517 — Outstanding Balances & Late-Fee Preview
- [x] Tenant-scoped outstanding balance endpoint and student filter with bounded response
- [x] Charge-level aging buckets and currency totals
- [x] School late-fee policy API and Finance UI
- [x] Fixed/percentage preview, grace days, cap and disabled-by-default safe setting
- [x] Focused source verifier and finance regressions
- [ ] Installment-level aging, live DB/API/RLS acceptance, RBAC/tenant negative tests and assessment lifecycle
- [ ] Full build/typecheck, browser print/accessibility and mobile/E2E acceptance


## P518
- [x] Refund summary API with currency/status totals
- [x] Payment-level over-reserved detection
- [x] Finance UI summary and exception details
- [x] Focused verifier 25/25 and P510–P518 regressions
- [x] API/UI parser diagnostics zero
- [ ] Runtime DB/API, tenant/RBAC-negative, concurrency, build, browser/E2E acceptance
- [x] Cumulative ZIP, SHA-256, manifest, CRC verification

## P519
- [x] Parent fees endpoint returns installment schedule and installments
- [x] Formal receipt snapshot and invoice number returned with parent-visible payments
- [x] Payment installment allocations included in parent API
- [x] Parent mobile displays installments, receipt number/status, invoice number and payment allocation details
- [x] Existing parent refund request and read-only payment constraints preserved
- [x] P519 focused verifier 29/29 PASS
- [x] P510–P519 focused finance verifier regression suite PASS
- [x] Modified TS/TSX parse diagnostics zero
- [ ] Formal receipt dedicated view/print/download, pagination/export, runtime guardian/tenant/RBAC and mobile/device acceptance
- [ ] Full build/typecheck and E2E acceptance
- [x] Cumulative archive, checksum, manifest, ZIP CRC and baseline comparison


## P520
- [x] Consolidated Finance overview dashboard added
- [x] Currency-grouped billed, concession, paid, estimated outstanding and refund lifecycle summaries
- [x] Invoice/refund/overdue counts and late-fee preview status surfaced
- [x] Reconciliation readiness context and receipt-prefix caveat shown
- [x] P520 focused verifier 24/24 PASS
- [x] P510–P520 finance regression verifier sequence PASS
- [x] FinanceWorkspace TSX syntax parser 0 diagnostics
- [ ] Server-side aggregation and authoritative ledger reconciliation
- [ ] Runtime DB/API, tenant/RBAC-negative, full build/typecheck, browser/mobile/E2E acceptance
- [x] Cumulative ZIP, checksum, manifest, CRC and baseline comparison

- [x] P521 server-side Finance aggregation source, readiness indicators, aggregated CSV export, verifier and cumulative archive.
- [ ] P521 runtime database, tenant-negative, reconciliation, build/typecheck, browser and E2E acceptance.
- [x] P522 source-to-ledger reconciliation endpoint (payments/refunds), cash-clearing account convention, exception summary, UI display, focused verifier and cumulative archive.
- [ ] P522 runtime lifecycle/DB fixtures, tenant-negative/performance tests, full typecheck/build, browser accessibility and E2E acceptance.

- [x] P523 validated reconciliation date-window filtering, source payment/refund date semantics, and capped source/journal drill-down UI/API.
- [ ] P523 runtime fixture validation for date cutoffs and transaction lifecycle, performance/tenant-negative tests, full typecheck/build, browser accessibility and E2E acceptance.


## P524 Finance Lifecycle Status Matrix
P524 added payment/refund lifecycle counts and amount aggregation by currency/status and a diagnostic Finance Workspace view. Runtime acceptance remains open.

- [x] P528 transition preflight metadata API and structured blocker codes (source verifier 21/21; runtime validation pending).

## P529 Update

P529 — Admissions Document Checklist & Rule Resolution: source implementation delivered; focused verifier 22/22 PASS and P528 regression 21/21 PASS. Runtime/build/UI/E2E validation remains open.

## P530 P530 delivery checklist
- Completed source implementation and focused verification (25/25 assertions).
- C2-09 admissions/document/communications progress: 5/12 phases complete (P526–P530).
- Next phase: P531. Runtime/build/E2E remain pending.

## P538
- P538 foundation/audit deliverables mirrored at archive root and `docs/phases/P538/`.
- C2-10 roadmap `C2-10-ROADMAP.md` mirrored at root, `docs/`, and `docs/phases/`.
