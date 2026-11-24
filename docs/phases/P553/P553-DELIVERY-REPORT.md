# P553 Delivery Report — Library Borrower Policies

## Scope and implementation
- Added school-scoped borrower policy model for STUDENT and STAFF categories.
- Configurable loan duration, active loan cap, renewal cap, renewal duration, overdue fine/day and overdue-renewal permission.
- Loan issuance checks active loans against policy and defaults due date from policy; custom due dates are capped to configured duration.
- Added renewal endpoint with overdue policy and renewal count guards.
- Returns calculate overdue fines from policy when no explicit fine override is supplied.
- School Admin Library workspace loads and edits borrower policies.
- Added Prisma schema changes and migration.

## Verification
- P553 focused checks: 34/34 PASS.
- P552 regression: 19/19 PASS.
- P551 regression: 35/35 PASS.
- P550 verifier executed; see `docs/phases/P553/P550-REGRESSION.txt`.
- API route and Admin LibraryWorkspace transpilation: 0 diagnostics.
- ZIP CRC, duplicates, baseline, manifest, SHA verification performed after packaging.

## Known open gaps
- Only STUDENT and STAFF borrower types; custom categories are not yet supported.
- Renewals staff/admin only; no borrower self-service. Reservation-aware renewal blocking not implemented.
- Fine amount can be overridden by staff; fine payment settlement is not integrated.
- Runtime DB migration, Prisma validation, full build/typecheck, browser/mobile/device, accessibility and E2E acceptance remain pending.
