# P45 migration

Adds canonical email delivery receipt events, provider message identifiers and terminal bounce/complaint states. Apply after P44 using the normal Prisma migration deployment process. Rollback is intentionally not automated: event history is audit evidence. A reviewed rollback must first export event rows, then drop the delivery-event table and columns/constraint changes. Do not roll back after production receipt ingestion without preserving the event ledger.
