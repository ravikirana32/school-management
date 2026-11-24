# P134 — Cross-Batch Operationalization and Historical Subledger Reconciliation

## Scope
P134 extends the P131 historical operationalization route to consume the immutable P133 cross-batch allocation records.

## Allocation behavior
- For a PAYMENT source row, the route resolves `PAYMENT_TO_CHARGE` allocations.
- For a REFUND source row, the route resolves `REFUND_TO_PAYMENT` allocations.
- If no allocation exists, the legacy same-batch source-reference relationship remains supported.
- A P133 allocation used for operationalization must be exactly one allocation for the source row, match the full source amount in minor units, and have the expected allocation type.
- The target must be POSTED, belong to the same student and currency, and not predate the source transaction.
- A cross-batch target must already have its operational link created. The target batch is not implicitly operationalized by this request.
- The operational payment uses the target charge's operational ID; the operational refund uses the target payment's operational ID.
- Existing historical journals are not reposted.

## Deliberate boundaries
`AccountingHistoricalOperationalLink` is one-to-one with a historical row. P134 therefore rejects split/partial allocations during operationalization rather than silently collapsing them or losing allocation detail. Multi-batch dependency orchestration is also not automatic: target batches must be operationalized first. P134 does not transfer funds, prove settlement, change source historical rows, or bypass the separate approval/posting workflow.

## Security and transaction behavior
The existing tenant-scoped operationalization transaction and per-batch advisory lock remain in place. Allocation reads are constrained by organization and school. Target rows are validated against their posted batch, student, currency and date before operational records are created. Any failed validation aborts the transaction. Same-batch references continue to work for previously imported records without P133 allocation rows.

## API
Existing endpoint enhanced:
`POST /:organizationId/:schoolId/parents/accounting/historical-imports/:batchId/operationalize`

No new Prisma model or migration is introduced in P134; it consumes P133's `AccountingHistoricalAllocation` and `AccountingHistoricalOperationalLink` models.

## Verification limits
Static source verifier and regression verifiers can validate source invariants only. Prisma schema validation/client generation, PostgreSQL migration/runtime RLS/trigger execution, concurrency, semantic typecheck, API execution and production build remain pending. Unit/API/browser/mobile test creation and execution remain deferred as instructed.
