# P517 Delivery Report — Outstanding Balances & Late-Fee Preview

## Delivered
- New `FeeLateFeePolicy` Prisma model and SQL migration with tenant uniqueness, input constraints and forced RLS.
- API `GET /fees/outstanding`: published charge balances, approved concessions, aging buckets (CURRENT, 1–30, 31–60, 61–90, 90+), currency totals, late-fee preview; optional student ID and maximum 500 records.
- API `PUT /fees/late-fee-policy`: validated, tenant-scoped upsert, `fees.manage` permission and audit event.
- Finance workspace aging table, refresh, preview and policy controls.
- Late fee calculation uses integer minor units and supports fixed/percentage, grace days and cap; policy remains disabled by default.

## Verification
- P517 focused verifier: 58/58 PASS.
- P515 verifier: 45/45 PASS.
- P514 verifier: 43/43 PASS.
- P513 verifier: 27/27 PASS.
- Modified route and UI TS/TSX parser diagnostics: 0.
- Runtime DB migration, live API, tenant-negative/RBAC-negative, full typecheck/build and browser acceptance not run in this workspace.

## Known limitations / carried gaps
- Aging is charge-level, not installment-level.
- Late fee is a preview only; assessment approval, idempotent posting, reversal and period lifecycle are not implemented.
- Live DB validation and operational reconciliation are pending.
