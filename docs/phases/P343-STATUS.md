# P343 — Admission Payment Lifecycle

**Status:** Cycle 1 source implementation delivered; runtime acceptance remains open.

## Baseline audit
The existing API already created a student fee payment and admission receipt, updated the charge balance/status for partial or full payment, enforced school/org scope and `fees.manage`, and rejected overpayment. Schema uniqueness constraints already existed for charge/reference and receipt/payment reference. The School Admin workspace fetched fee handoffs but did not expose a payment-recording form or receipt list.

## Delivered
- Added School Admin UI to record admission fee payments against a fee handoff (amount, method, reference, payment date).
- Added receipt list to the Admissions workspace, refreshed after payment submission.
- Added explicit duplicate payment-reference conflict detection in the admission payment endpoint, avoiding a raw uniqueness exception for repeat references.
- Existing transaction, school scope, approved/published ledger-charge requirement, partial payment balance/status, receipt generation, and overpayment guard retained.

## Verification
- Source-level targeted assertions: 10/10 PASS.
- Dependency install/build/typecheck, live PostgreSQL/API, browser and E2E tests: NOT RUN (dependencies/runtime unavailable in this workspace).

## Open gaps
- P344 will handle receipt/refund lifecycle and refund reconciliation.
- Cycle 2: payment reference duplicate-race runtime verification, API/DB integration, receipt UX/print, browser/mobile and E2E.
