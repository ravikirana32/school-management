# P131 Status — Historical Fee Subledger Integration

**Status:** Source implementation complete; database/runtime verification pending.

## Delivered
- Added `relatedChargeSourceReference` for historical PAYMENT rows and `relatedPaymentSourceReference` for REFUND rows.
- Added `AccountingHistoricalOperationalLink` with tenant composite FK, forced RLS and append-only mutation guard.
- Added `accounting.historical-operationalize` permission and Finance Officer assignment.
- Added an operationalization endpoint for POSTED historical batches. It creates operational fee charges, payment allocations, settled refund records and refund events without reposting accounting journals.
- Added source graph, same-student, payment over-allocation, refund cap and duplicate charge preflight checks. Unexpected write-time failures abort the transaction.
- Added operational linkage reconciliation API and School Admin Finance workspace action/status.

## Accounting boundaries
- P130 journals are posted first; P131 does not post another journal.
- Payment and refund source links must point to rows in the same batch and same student.
- Refund rows require external settlement evidence and are materialized as SETTLED; no money transfer occurs.
- The workflow does not infer missing historical charges or payments.
- Signed control totals, opening-balance overlap, cross-batch allocation, fiscal-year conversion and external bank/provider settlement matching remain open.

## Deferred
- Prisma validation/client generation and PostgreSQL migration execution.
- API/runtime, RLS, trigger, concurrency, rollback and authorization verification.
- Unit/API/browser/mobile test creation and execution, deferred as instructed.

## Audited master gap inventory

P130 baseline contained 593 unique status-tagged IDs. P131 adds three new IDs and updates P130-G002 from OPEN to PARTIALLY_IMPLEMENTED. The P131 register therefore contains 596 unique IDs: 289 OPEN, 115 PARTIALLY_IMPLEMENTED, 178 READY_FOR_VERIFICATION, 14 BLOCKED_EXTERNAL, 0 IN_PROGRESS and 0 CLOSED. Root/docs register copies are byte-identical.

