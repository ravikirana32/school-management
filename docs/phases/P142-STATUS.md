# P142 Status — Refund Payment-Slice Reservation and Reconciliation

**Status:** Source implementation delivered; PostgreSQL/runtime verification pending.

## Delivered
- Added transaction-scoped advisory locking for refund allocation reservation keyed by tenant and operational payment slice.
- Revalidated the selected operational payment slice under organization, school, student and currency scope.
- Enforced refundable capacity against active operational refunds plus unmaterialized historical refund allocations.
- Excluded allocations already materialized into operational refunds from pending reservations to avoid double counting.
- Extended searchable slice reconciliation with pending allocation and net available refundable balances.
- Applied the same slice lock and active-refund cap during operationalization.
- Updated School Admin Finance to display pending allocation reservations.
- Updated root and docs master gap registers identically.

## Gap changes
- P140-G001 and P141-G001 remain PARTIALLY_IMPLEMENTED pending runtime evidence.
- Added P142-G001 as PARTIALLY_IMPLEMENTED; concurrent PostgreSQL behavior and end-to-end reconciliation require runtime verification.
- No gaps closed.

## Test policy
Unit, API, browser and mobile test creation/execution remain deferred. Static source verification is not runtime acceptance.
