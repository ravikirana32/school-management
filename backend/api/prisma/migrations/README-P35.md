# P35 migration

Adds composite descending keyset-pagination indexes for fee charges, homework assignments, report cards and parent notifications. The migration is additive and does not rewrite operational records or relax existing RLS policies.

Apply using the normal Prisma migration deployment process after validating the P34 baseline. For large production tables, assess `CREATE INDEX CONCURRENTLY` in a separately managed non-transactional deployment; Prisma's standard migration transaction behavior must be considered before changing this SQL.
