# P138 Status — Historical Split Allocation Operationalization

**Status:** API source implementation delivered; PostgreSQL migration/runtime verification pending.

## Completed
- Consumes multiple immutable `PAYMENT_TO_CHARGE` allocations for one historical payment row and creates one operational payment per allocation slice.
- Consumes multiple immutable `REFUND_TO_PAYMENT` allocations for one historical refund row and creates one settled operational refund per allocation slice.
- Writes `AccountingHistoricalOperationalAllocationLink` rows for each materialized allocation; preserves legacy same-batch `AccountingHistoricalOperationalLink` behavior.
- Requires allocation slices to sum exactly to the immutable historical source row amount; validates target charge/payment ceilings and updates amountPaid/payment/refund status per slice.
- Uses allocation-specific refund idempotency keys and preserves the original external settlement reference across slices.
- Extends repeat-operationalization detection to recognize fully materialized allocation-link rows.
- Updates historical batch APIs, operational reconciliation and dependency-plan readiness to count one-to-many links.
- Updates School Admin Finance to display allocation-slice linkage and correct linked-row coverage.
- Adds a migration to allow one external settlement reference to map to multiple split refund records.
- Updates root and docs master gap registers identically.

## Explicit limitations
- A refund targeting a historical payment that itself maps to multiple operational payment slices is rejected safely; allocation evidence does not yet identify the intended payment slice.
- Allocation totals below or above the source row amount are blocked; unallocated source remainders are not materialized.
- Dependency planning remains advisory; automated multi-batch execution and resumable orchestration are not implemented.
- PostgreSQL migration application, Prisma generation and runtime verification remain pending.

## Gap changes
- P134-G003, P135-G002, P136-G001 and P137-G002 remain partially implemented with P138 source integration added.
- P138-G001 PARTIALLY_IMPLEMENTED; P138-G002 OPEN; P138-G003 OPEN.
- No gaps closed.

## Test policy
Unit, API, browser and mobile test creation/execution remain deferred per project instruction. Only static source verification is included; this is not runtime acceptance.
