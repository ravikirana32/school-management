# P129 — Opening balance import

Apply after P128 on PostgreSQL. The migration creates tenant-RLS protected staging batches and student-level rows, enforces one-sided positive amounts, tenant-safe student/batch references, draft-only row mutation, and one-way approval/posting status transitions.

The import workflow is deliberately evidence-driven: a creator supplies a source description/reference and student-level source references; a different authorized user approves; an authorized finance user posts. Posting writes one balanced net receivables/opening-equity journal in the accounting period containing `asOfDate`. The detailed debit/credit allocations remain in immutable approved batch rows. This is not a migration of legacy fee charge/payment/refund records and does not invent historical transactions. Obtain signed/approved source balances before use.
