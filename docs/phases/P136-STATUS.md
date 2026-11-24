# P136 Status — One-to-Many Operational Allocation Link Foundation

**Status:** Schema and migration source delivered; PostgreSQL runtime verification pending.

## Completed work
- Added `AccountingHistoricalOperationalAllocationLink`, mapping each immutable allocation slice to one operational charge and exactly one operational payment or refund.
- Added unique allocation/payment/refund mappings to prevent duplicate materialization and operational-record reuse.
- Added tenant-composite foreign keys, positive-amount and payment/refund shape constraints, tenant RLS with FORCE, and source-row indexing.
- Added Prisma inverse relations while preserving the existing P131 one-to-one link model for backward compatibility.
- Added P136 API/data-model documentation and a static source verifier.

## Remaining limitations
- P134 operationalization still rejects split/partial allocations. This phase establishes the one-to-many persistence model but does not yet create multiple operational payment/refund records.
- Dependency-plan execution, retryable orchestration and allocation remainder reconciliation remain outstanding.
- Migration application, Prisma client generation and runtime PostgreSQL verification are pending.

## Gap changes
- P134-G003 and P135-G002 moved to PARTIALLY_IMPLEMENTED: one-to-many persistence foundation delivered; split materialization and reconciliation remain.
- P136-G001 PARTIALLY_IMPLEMENTED: migration/model foundation delivered; runtime verification and operationalizer integration remain.
- No gaps closed.

## Test policy
Unit, API, browser and mobile test creation/execution remain deferred. Static source verification only; no runtime acceptance is claimed.
