# P142 — Refund Payment-Slice Reservation and Reconciliation

## Behavior

- Refund-to-payment allocation creation takes a transaction-scoped PostgreSQL advisory lock keyed by organization, school and operational payment slice.
- The selected payment is reloaded within the tenant, student and currency scope before its refundable capacity is evaluated.
- Capacity includes active operational refunds in `REQUESTED`, `APPROVED_PENDING_SETTLEMENT` and `SETTLED` states, plus historical refund allocations reserved against the slice but not yet materialized into an operational refund.
- Allocations already materialized into an operational refund are not counted a second time as pending reservations.
- Requests exceeding the remaining refundable capacity are rejected with HTTP 409.
- The searchable payment-slice response now reports pending allocation amount and computes available refundable balance after both active refunds and pending reservations.
- Operationalization obtains the same payment-slice advisory lock before rechecking the refundable limit and materializing a refund, serializing allocation reservation and refund materialization for the same slice.
- School Admin Finance displays pending reservation amounts alongside paid, refunded and available balances.

## Safety and limits

The advisory lock is transaction-scoped and includes tenant identifiers. It coordinates this historical-allocation workflow; it does not replace the database transaction or existing tenant constraints. Existing active refund requests are included in the cap. Historical accounting journals are not reposted.

## Verification policy

The P142 static verifier checks source contracts and documentation parity. PostgreSQL migration/runtime, concurrent transaction, authorization and tenant-isolation acceptance remains pending. Unit, API, browser and mobile test creation/execution remain deferred under the project instruction.
