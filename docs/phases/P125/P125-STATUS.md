# P125 Status — Fees, Payments and Financial Resource Authorization

**Status:** Source implementation complete; runtime acceptance pending.

## Implemented
- Added `fees.payments.read` and `fees.payments.record` permissions.
- Added least-privilege seeded `SCHOOL_FINANCE` role.
- Restricted School Admin payment-detail fields in the fee list to callers with `fees.payments.read`.
- Restricted manual payment recording to `fees.payments.record`.
- Preserved `fees.manage` for fee-charge creation and publication.
- Preserved parent fee access through consent-bound `parent.fees.read`.
- Preserved existing duplicate-reference, overpayment, advisory-lock, tenant-scope and audit behavior.

## Not implemented
- Refund/partial refund/reversal and credit-note lifecycle.
- Gateway checkout and provider settlement integration.
- Balanced accounting ledger and reconciliation.

## Validation boundary
Static source verifier and syntax-only checks are intended for this phase. Unit, API, browser and mobile test creation/execution remain deferred as instructed. Prisma validation, migration execution, semantic typecheck, application build and runtime authorization tests are not claimed.
