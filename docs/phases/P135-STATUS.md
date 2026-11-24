# P135 Status — Historical Batch Dependency Planning and Allocation Readiness

**Status:** Dependency planning API and School Admin preview implemented; multi-batch execution and split operational linkage remain incomplete.

## Delivered
- Added `GET /accounting/historical-imports/operationalization-plan` under the existing school-scoped parent API route namespace.
- Plan is tenant-scoped and bounded to 200 requested IDs / 2,000 posted batches / 10,000 allocation edges.
- Expands prerequisite batches transitively for selected batches.
- Computes deterministic topological order with prerequisite batches first.
- Reports cycles rather than returning an unsafe execution order.
- Reports batch row/link counts, prerequisite IDs, target operational-link readiness and blocked dependencies.
- Added School Admin Finance workspace action and ordered dependency preview.

## Deliberate limitations
- The planner is read-only; it does not automatically invoke operationalization or execute multiple batches in one transaction.
- P131 operational linkage remains one-to-one per historical source row. Split/partial allocations are not yet materialized into multiple operational payments/refunds.
- P133 partial allocation evidence remains supported in staging; P134 operationalization still requires one full-value allocation per source row.
- No privileged accounting workflow was added to parent/teacher mobile apps.
- No database migration was added.

## Gap changes
- P134-G002 moved from OPEN to PARTIALLY_IMPLEMENTED (planning delivered; execution remains).
- P135-G001 PARTIALLY_IMPLEMENTED (dependency planning).
- P135-G002 OPEN (one-to-many operational linkage and split materialization).
- No gaps closed.

## Verification policy
- Unit, API, browser and mobile test creation/execution remain deferred per project instruction.
- Static source verifier only; no runtime PostgreSQL, migration, build or mobile acceptance is claimed.
