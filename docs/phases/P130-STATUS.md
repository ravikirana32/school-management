# P130 Status — Historical Fee Transaction Migration

**Status:** Source implementation complete; database/runtime verification pending.

## Delivered
- Tenant-scoped historical import batches and rows for CHARGE, PAYMENT and externally evidenced REFUND events.
- Original source references, student IDs, dates, amounts, methods and settlement references retained.
- Independent approval, approval note, append-only-after-approval behavior and audit events.
- Transactional posting to immutable ledger journals using source types `HISTORICAL_CHARGE`, `HISTORICAL_PAYMENT`, `HISTORICAL_REFUND` and original transaction dates.
- Idempotency via journal source uniqueness, school-wide source type/reference uniqueness across batches, and transaction advisory locks.
- Student-wise staged historical receivable reconstruction endpoint.
- School Admin Finance workspace import, approval, posting and reconciliation surfaces.
- Permissions `accounting.historical-import.approve`; Finance Officer can approve staged imports, but must not approve their own batch.

## Important accounting boundaries
- No historical records are fabricated. A school must provide verified source rows.
- Historical imports post accounting journals only; they do not recreate operational fee charges, payment records or refund lifecycle records and do not rewrite current charge `amountPaid`.
- Historical refund rows require external settlement evidence and do not transfer money.
- Original dates are used for posting. Closed historical periods cause posting to fail; no silent date shifting or period reopening is performed.
- Student-wise reconstruction is a staging control report, not a replacement for signed source schedules or operational fee balance reconciliation.
- Currency is batch-scoped; separate batches are required per currency.

## Deferred
- Full import preview/dry-run and signed control-total upload.
- Linking imported historical payments/refunds to operational charge/payment IDs.
- Backfill of operational fee tables and refund event histories.
- Fiscal-year conversion, closed-period adjustment policy, bank/provider reconciliation and statutory/tax accounting.
- Unit/API/browser/mobile test suites and local runtime validation, deferred as instructed.

## Master gap register inventory
The root/docs register copies are byte-identical. A subsequent archive audit corrected the earlier count: the P130 cumulative master register contains **593 unique status-tagged gap rows**: 288 OPEN, 114 PARTIALLY_IMPLEMENTED, 177 READY_FOR_VERIFICATION and 14 BLOCKED_EXTERNAL; IN_PROGRESS and CLOSED are both 0. The earlier 781-ID figure and its status breakdown were not supported by the archived register table. Three new P130 gaps are carried forward; no historical gap ID was removed.
