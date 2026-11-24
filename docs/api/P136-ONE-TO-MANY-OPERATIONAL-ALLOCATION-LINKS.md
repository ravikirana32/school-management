# P136 — One-to-Many Historical Operational Allocation Link Foundation

P136 adds a tenant-scoped operational mapping table that associates each immutable historical allocation slice with its own operational payment or refund and the operational charge it affects. Each allocation can be materialized at most once; operational payment/refund records cannot be reused by another allocation link. Positive minor-unit amounts are stored at the source allocation precision.

The existing P131 `AccountingHistoricalOperationalLink` remains unchanged for backward compatibility. Existing same-batch and full-value cross-batch behavior is preserved. The new relation is a foundation: this phase does not yet create split operational payments/refunds, change the P134 operationalization route, or execute dependency plans.

The migration adds composite tenant foreign keys, tenant RLS with FORCE, unique constraints, amount and shape checks, and a source-row index. Runtime PostgreSQL migration and behavior verification remain outstanding. Unit/API/browser/mobile test creation and execution remain deferred.
