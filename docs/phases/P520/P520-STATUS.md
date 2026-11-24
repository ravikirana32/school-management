# P520 Status — Finance Consolidation

Status: **Completed source implementation and focused verification**

P520 adds an operational consolidated finance overview in `apps/school-admin/src/FinanceWorkspace.tsx` using existing loaded finance data: charges, invoices, payments, approved concessions, outstanding rows, refund lifecycle totals, configured payment methods and clearing-reconciliation readiness. Monetary totals use integer minor units and are grouped by currency. Late-fee preview remains non-posting.

- Focused verifier: `scripts/verify-p520-finance-consolidation.mjs`
- Focused assertions: 24/24 PASS
- P510–P520 focused finance verifier sequence: PASS
- FinanceWorkspace TSX parser diagnostics: 0
- Runtime DB, full build/typecheck, browser/mobile/E2E acceptance: not run; tracked open gaps
