# P127 accounting ledger migration

Creates the minimum school-scoped chart of accounts, monthly periods, immutable double-entry journals and lines. Enables and forces tenant RLS on all four tables. Database triggers reject journal mutation, reject postings into closed/out-of-range periods and defer a balanced-entry assertion until transaction commit.

Apply only after reviewing the SQL against the target PostgreSQL version and backup/rollback procedure. Migration execution was not performed as part of P127 source delivery. Historical fee charges and balances are not backfilled; see P127-G002.
