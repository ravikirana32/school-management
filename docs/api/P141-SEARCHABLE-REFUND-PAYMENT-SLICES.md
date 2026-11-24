# P141 — Searchable refund payment slices

`GET /accounting/historical-imports/refund-payment-slices/:targetRowId?q=<term>` requires `accounting.reconcile`. It is tenant-scoped and accepts a posted historical `PAYMENT` row. The result contains only operational payments linked through the legacy one-to-one link or P136 allocation links. Optional `q` searches payment ID, reference and method; the response is capped at 100 rows.

Each slice returns paid amount, active refunds (REQUESTED, APPROVED_PENDING_SETTLEMENT, SETTLED), available refundable amount and a refund state. Amounts are computed in integer minor units. A zero available balance is disabled in the School Admin selector. The API also returns the total number of linked slices so the UI auto-selects only when exactly one slice exists; a filtered search result is not mistaken for a single-slice target. The existing allocation POST endpoint remains authoritative for target validation and refund materialization.

Runtime PostgreSQL and tenant-isolation verification is pending.
