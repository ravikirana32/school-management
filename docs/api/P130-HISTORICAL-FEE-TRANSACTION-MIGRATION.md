# P130 — Historical Fee Transaction Migration API

The P130 historical import is a controlled accounting-ledger migration workflow.

## Source row contract
`sourceType` is `CHARGE`, `PAYMENT` or `REFUND`; each row requires `studentId`, `sourceReference` (unique across all batches for a school and source type), `originalTransactionDate` (`YYYY-MM-DD`) and a positive two-decimal `amount`. `method` is optional. `REFUND` additionally requires `externalSettlementReference`. Currency is set once on the batch.

## Lifecycle
1. Finance creates a draft batch from verified legacy source rows.
2. A different user with `accounting.historical-import.approve` approves with a reason.
3. A user with `accounting.post` posts the batch transactionally. Each row becomes one immutable journal using its original transaction date.
4. The reconciliation endpoint groups approved/posted source rows by student and currency and reports charges, payments, refunds and net receivable.

## Accounting treatment
- Charge: debit receivable, credit fee revenue.
- Payment: debit cash/bank clearing, credit receivable.
- Settled refund: debit receivable, credit cash/bank clearing.

This import does not recreate operational fee records or perform money movement. Refund references are evidence supplied by the operator, not gateway verification. A closed historical accounting period blocks posting; no posting date is silently changed. Import separate batches for separate currencies.
