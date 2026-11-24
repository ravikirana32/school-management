# P136 Delivery Report

P136 introduces a separate one-to-many operational allocation link model. Each immutable historical allocation record can map to one operational payment or refund, while retaining its target operational charge and allocated amount. Unique constraints prevent an allocation from being materialized twice or an operational payment/refund from being attached to multiple allocation records. Composite tenant foreign keys and forced row-level security protect the new mapping table.

The existing P131 one-to-one operational link is intentionally retained to avoid breaking prior data and current consumers. Therefore P136 is a persistence foundation, not full split-allocation operationalization. P134 still rejects split allocations until the next phase integrates the new table into the transaction, creates per-allocation operational records, and reconciles target balances. PostgreSQL migration and runtime verification are pending.
