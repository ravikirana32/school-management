# P140 Status — Refund Payment-Slice Targeting

**Status:** Source implementation complete; PostgreSQL/runtime verification pending.

## Delivered
- Added nullable `targetOperationalPaymentId` to historical allocation evidence with a tenant-scoped foreign key to `StudentFeePayment`.
- Extended `REFUND_TO_PAYMENT` allocation API to validate that the selected payment belongs to the target historical payment row.
- Automatically records the only available payment slice for single-slice targets; requires an explicit selection when multiple slices exist. A refund and its split payment must be operationalized in separate batches so the payment-slice ID exists before refund allocation.
- Updated refund operationalization to use the selected payment slice and retain per-payment refund caps, charge balance updates, refund status transitions, settlement evidence and allocation-link idempotency.
- Updated dependency planning to recognize an explicitly selected operational payment slice.
- Updated School Admin Finance to enter and view operational payment-slice IDs.
- Updated P138 verification expectation and both master gap registers.

## Gap changes
- P138-G002 moved from OPEN to PARTIALLY_IMPLEMENTED.
- P140-G001 added as PARTIALLY_IMPLEMENTED pending PostgreSQL/runtime acceptance.
- No gaps closed.

## Test policy
Unit, API, browser and mobile test creation/execution remain deferred per project instruction. Static verifiers and syntax checks are not runtime acceptance.
