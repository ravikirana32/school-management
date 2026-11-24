# P133 — Historical Financial Exception Management and Cross-Batch Allocation

## Scope delivered
- Added tenant-scoped immutable `AccountingHistoricalAllocation` rows for PAYMENT_TO_CHARGE and REFUND_TO_PAYMENT links across posted historical batches.
- Enforced matching student, currency, source/target types, posting status, date order, positive paise amounts, source and target allocation ceilings, duplicate rejection and serialized endpoint-row locks in the API. A database trigger repeats the critical row/type/date/amount guards.
- Added persisted `AccountingHistoricalException` and append-only `AccountingHistoricalExceptionEvent` records. Finance users can scan posted historical imports for missing, orphaned, ambiguous or partially allocated relationships and resolve exceptions with a required audit note.
- Added School Admin Finance controls to record/view allocations and scan/resolve open exceptions. Historical row identifiers are displayed with batch rows for controlled selection.
- Corrected a P131 operationalization variable-order defect: the refund collection is now initialized before refund validation.

## Important boundaries
- Cross-batch allocation records are evidence only in P133. The P131 operationalization routine still expects same-batch related source references and does not yet consume P133 allocations. This is explicitly tracked as P133-G002.
- Exception resolution records a finance decision; it does not mutate historical source rows, create journals, or automatically mark a financial discrepancy as corrected.
- No bank feed, provider settlement, source-document cryptographic signature or external payment transfer is implemented.

## Verification
- Static P133 source verifier and prior-phase regression verifiers are included.
- TypeScript/TSX syntax transpilation is performed without semantic typechecking.
- Prisma validation/client generation and PostgreSQL migration/RLS/trigger/concurrency execution remain pending.
- Unit/API/browser/mobile test creation and execution remain deferred as instructed.

## Gap treatment
- P131-G003 and P132-G003 move to PARTIALLY_IMPLEMENTED.
- Added P133-G001 READY_FOR_VERIFICATION, P133-G002 OPEN and P133-G003 OPEN.
- No gaps are closed. Root/docs open-gap registers and resolved-history mirrors are byte-identical.

## Cumulative gap inventory

The master register contains 602 status-tagged gap IDs: OPEN 289, PARTIALLY_IMPLEMENTED 118, READY_FOR_VERIFICATION 181, BLOCKED_EXTERNAL 14, IN_PROGRESS 0 and CLOSED 0. No prior IDs were removed and no gaps were closed in P133.

## Cumulative archive audit

- P132 baseline: 1,341 entries.
- P133 archive: 1,355 entries.
- New paths: 14; modified existing paths: 10; missing previous paths: 0.
- ZIP integrity and all prior path-preservation checks: PASS.
- Download SHA-256 is provided in the external checksum sidecar.
