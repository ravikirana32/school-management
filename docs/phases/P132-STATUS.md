# P132 — Historical Financial Control Totals and Opening Balance Reconciliation

Date: 2026-11-18
Baseline: P131 cumulative archive (`school-management-saas-P131-cumulative.zip`)

## Delivered
- Added optional operator-declared historical charge/payment/refund totals to `AccountingHistoricalImportBatch`.
- Validates declared totals against imported rows using integer minor units; incomplete/negative/mismatched values are rejected.
- Independent approval rechecks stored declared totals against immutable batch rows.
- Added `GET /accounting/historical-imports/control-reconciliation` for per-batch computed/declared totals and unverified/mismatched batch counts.
- Added `GET /accounting/historical-imports/opening-overlap` for student/currency comparison of historical net receivables against approved/posted opening balance rows.
- Integrated declared-total inputs and review results into the School Admin Finance workspace.
- Added additive migration `20261118160000_p132_historical_control_totals`.

## Accounting and source-evidence boundaries
Declared totals are operator-provided assertions, not digital signatures or proof of document authenticity. An opening-overlap flag is a review signal only: as-of dates and historical coverage windows may differ. The API does not auto-adjust balances, suppress imports, declare a duplicate, or post any additional journal. Cross-batch payment/refund allocation, signed evidence, fiscal-year conversion and external bank/provider matching remain open.

## Verification
- P132 static source verifier: 16/16 PASS.
- P131 regression verifier: 27/27 PASS.
- P130 regression verifier: 17/17 PASS.
- TypeScript/TSX transpile syntax diagnostics: 0 in changed route and Finance workspace files.
- Package JSON and root/docs register parity: PASS.
- Prisma validation/client generation, PostgreSQL migration execution, RLS/runtime authorization, application builds and API execution: NOT RUN.
- Unit/API/browser/mobile test creation and execution: DEFERRED as instructed.

No gap is closed in P132 because database/runtime and finance-source verification are pending.
