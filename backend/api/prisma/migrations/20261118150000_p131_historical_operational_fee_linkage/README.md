# P131 — Historical operational fee linkage

This migration follows P130. It aligns the `StudentFeeCharge.approvalStatus` column already present in the Prisma model/API with the database, adds explicit historical PAYMENT-to-CHARGE and REFUND-to-PAYMENT source references, and creates an append-only tenant-scoped operational link table.

Every link has a required operational charge reference. Payment and refund references are optional according to transaction type. Composite tenant foreign keys prevent cross-school linkage; the Prisma relations expose operational charge/payment/refund references. The table uses forced RLS and rejects UPDATE/DELETE/TRUNCATE.

A database insert trigger requires the historical source row's batch to be POSTED and validates same-student/currency ownership, original charge date/amount/reference, payment source allocation and amount/date/reference, and settled refund amount/payment/settlement evidence. The API additionally preflights complete-batch allocations before writes.

The operationalization endpoint requires `accounting.historical-operationalize`, a POSTED historical batch, explicit charge references for payments and explicit payment references for refunds. It does not repost accounting journals. Apply only after P130 and verify on PostgreSQL before production use.
