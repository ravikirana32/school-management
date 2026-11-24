# P129 Delivery Report

P129 adds a controlled opening-balance import foundation. Each batch is single-currency and date-scoped, contains student-level debit/credit rows with unique source references, and requires approval by a different user before posting. Posting creates a balanced journal between net Accounts Receivable and Opening Balance Equity in the period containing the as-of date. Repeated posting requests return the existing journal.

The implementation does not backfill legacy fee charges, payments or refunds; does not upload/verify source documents; and does not assert statutory compliance. Runtime migration/RLS/financial acceptance remains pending.
