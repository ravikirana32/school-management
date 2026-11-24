# P131 — Historical Fee Subledger Integration

## Purpose
P130 imported verified historical charge, payment and externally evidenced refund rows into immutable accounting journals. P131 adds a separately authorized step to materialize those rows into the operational fee subledger after the accounting batch is POSTED.

## Required source references
- CHARGE: `sourceReference` identifies the operational fee charge.
- PAYMENT: `relatedChargeSourceReference` must identify a CHARGE row in the same batch and same student.
- REFUND: `relatedPaymentSourceReference` must identify a PAYMENT row in the same batch and same student; `externalSettlementReference` remains mandatory.

## Workflow
1. Create the P130 historical import draft with explicit allocation references.
2. A different user approves the batch.
3. Post the historical accounting journals using the original dates and open accounting periods.
4. A user with `accounting.historical-operationalize` calls `POST /accounting/historical-imports/:batchId/operationalize`.
5. The API creates `StudentFeeCharge`, `StudentFeePayment`, `StudentFeeRefund` and `StudentFeeRefundEvent` records, then writes append-only `AccountingHistoricalOperationalLink` records.
6. The API does not call fee accounting hooks or post another journal.

## Reconciliation
`GET /accounting/historical-imports/operational-reconciliation` reports source rows linked/unlinked by transaction type. It is a linkage completeness report, not signed source-control-total approval.

## Controls
- Batch must already be POSTED.
- One transaction-scoped advisory lock serializes operationalization for a batch.
- Preflight validates source graph, same-student ownership, duplicate charge codes, payment allocations and refund caps before writes.
- Unexpected failures inside materialization throw, causing transaction rollback.
- Operational links have composite tenant FKs, forced RLS and append-only UPDATE/DELETE/TRUNCATE protection.
- Repeat request returns the existing linked count; partial existing link state is surfaced as a conflict for manual reconciliation.

## Boundaries
- Allocations are restricted to source rows within the same batch.
- Each historical CHARGE row becomes one operational fee charge.
- Payment amounts cannot exceed their referenced charge's outstanding balance. Refund totals cannot exceed the referenced payment or current charge paid balance.
- Historical refunds are materialized as SETTLED only because P130 requires external settlement evidence; no transfer is initiated.
- No accounting journal is reposted.
- Signed source totals, opening balance overlap, cross-batch allocation, fiscal-year conversion, external bank matching and production runtime verification remain open.
