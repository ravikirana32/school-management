# P140 — Refund Allocation to a Specific Operational Payment Slice

## Contract
`POST /accounting/historical-imports/allocations` accepts `targetOperationalPaymentId` for `REFUND_TO_PAYMENT` allocations. The ID must be an operational payment linked to the selected target historical PAYMENT row through its legacy operational link or one-to-many allocation links. If the target row has multiple operational payment slices, the caller must select one. A single-slice target is inferred and persisted. For split targets, operationalize the payment batch first, then create the refund allocation against the selected payment ID; same-batch split-payment refunds are rejected because the slice IDs are not available before the transaction.

## Materialization
The refund operationalizer uses the persisted target payment ID. It checks the payment and charge in the current organization/school, checks the settled refund aggregate against that payment's amount, updates charge amountPaid/status, updates payment status to PARTIALLY_REFUNDED or REVERSED, records the settlement event, and creates the immutable allocation-to-operational-refund link. Existing accounting journals are not reposted.

## Safety and rollout
The migration adds a nullable composite tenant-scoped FK from `AccountingHistoricalAllocation` to `StudentFeePayment`. Apply migrations and regenerate Prisma before deploying API code. Runtime PostgreSQL verification is required before closing P138-G002/P140-G001.
