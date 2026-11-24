# P139 Status — Dependency-Ordered Historical Batch Execution

**Status:** Source implementation delivered; PostgreSQL/runtime verification pending.

## Completed
- Added tenant-scoped multi-batch execution endpoint with a 200-batch request bound.
- Expands prerequisites and computes target-first topological order from immutable allocation dependencies.
- Detects cycles before execution and makes no changes when a cycle is present.
- Reuses the existing single-batch transactional worker and advisory transaction lock for each batch.
- Commits batches independently, stops safely on failure, records an audit progress summary and supports idempotent retry/resume.
- Added School Admin Finance execution action and progress/blocker display.
- Updated root/docs master gap registers identically.

## Limitations
- PostgreSQL migration/client/runtime verification and concurrent execution acceptance remain pending.
- A batch failure does not roll back earlier committed batches; retries resume by skipping already operationalized batches.
- P138-G002 (refund allocation to a specific payment slice) remains open.
- Unit/API/browser/mobile test creation and execution remain deferred.

## Gap changes
- P134-G002, P136-G002, P137-G003 and P138-G003 advanced to PARTIALLY_IMPLEMENTED.
- P139-G001 added as PARTIALLY_IMPLEMENTED.
- No gaps closed.
