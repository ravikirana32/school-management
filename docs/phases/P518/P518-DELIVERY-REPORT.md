# P518 Delivery Report — Refunds & Reconciliation

- Added `GET /fees/refunds/reconciliation-summary`, permission-gated by `accounting.reconcile`, under tenant context.
- Currency totals for requested, approved-pending-settlement, settled, rejected, active reserve and record count.
- Detects payment-level reserve + settled totals exceeding original payment; emits exception details.
- Bounded recent-refund sample (5,000) and `capped` indicator.
- FinanceWorkspace displays totals and exception rows.
- Existing request/approval/rejection/settlement behavior preserved.

## Verification
P518 focused verifier: **25/25 PASS**. Finance regressions: P510 23/23; P511 16/16; P512 13/13 + 6 arithmetic; P513 27/27; P514 43/43; P515 45/45; P516 69/69; P517 58/58; P518 25/25. Backend TS parser 0 diagnostics; Finance TSX parser 0 diagnostics.

## Not yet validated
Runtime DB/API, tenant/RBAC negative tests, concurrency, full build/typecheck, browser/device/E2E and actual accounting/clearing reconciliation. This is not bank statement reconciliation.
