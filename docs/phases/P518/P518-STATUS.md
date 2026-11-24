# P518 Status — Refunds & Reconciliation

**Completed: source implementation and focused checks.**

Tenant-scoped Finance refund reconciliation summary by currency and status; requested, approved-pending, settled, rejected and count totals; active reservation totals; detection of payments with reserved/settled refunds greater than original payment; Finance UI display. Result is bounded to 5,000 rows and exposes a capped indicator. No money movement is initiated; this is not bank statement reconciliation.

P518 verifier 25/25 PASS. P510–P518 focused regressions pass. Backend TS and FinanceWorkspace TSX parse diagnostics are 0. Runtime DB/API, tenant/RBAC negative, concurrency, browser, full build/typecheck and E2E remain pending.
