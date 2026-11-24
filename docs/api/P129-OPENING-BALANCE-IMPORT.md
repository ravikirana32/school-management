# P129 — Historical Accounting Migration and Opening Balances

## Scope
P129 adds an auditable opening-balance import foundation. It does not fabricate old fee transactions or backfill historical charges/payments/refunds.

## Workflow
1. `POST /:organizationId/:schoolId/parents/accounting/opening-balances` creates a draft batch with one currency, an as-of date, source description/reference, and up to 5,000 student allocations. Each row has a unique source reference and exactly one positive debit or credit amount. Students are validated against the current organization and school.
2. `GET .../accounting/opening-balances` lists the tenant's batches and student allocations.
3. `POST .../accounting/opening-balances/:batchId/approve` requires `accounting.opening-balance.approve`, a substantive approval note, and a user different from the creator.
4. `POST .../accounting/opening-balances/:batchId/post` requires `accounting.post` and an approved batch. It posts a balanced net receivables/opening-equity journal dated on the batch as-of date. Repeated requests return the already-posted journal.

## Accounting treatment
Student-level allocations are retained as the import subledger evidence. The journal posts the net debit/credit to Accounts Receivable (1100) with the offset to Opening Balance Equity (3000). Opposing student balances are not discarded: the original gross debit/credit allocations remain in the batch rows. If net total is zero, the batch is not posted and requires finance review rather than creating a zero-value journal.

The journal uses the accounting period containing the as-of date. The period must be open. The source description and source document reference should identify signed/approved opening schedules. The API does not attach or verify the source document itself.

## Controls
- Tenant RLS and composite tenant foreign keys on batch and row tables.
- Student belongs to the same organization and school.
- Batch number and row source references are unique within their scopes.
- Rows can only be inserted/changed/deleted while batch is DRAFT.
- Approval is a separate actor; approval and posting transitions are auditable.
- Posted batch is immutable; journal remains append-only.
- No automatic fee charge/payment/refund backfill, no external bank balance import, and no tax/statutory accounting assertion.

## APIs and permissions
- Create/list: `accounting.post` / `accounting.read`.
- Approve: `accounting.opening-balance.approve`.
- Post: `accounting.post`.
- Finance Officer intentionally does not receive the approval permission by default; School Admin receives it through the existing complete permission catalogue.

## Verification boundary
Static source verification only. Prisma validation/client generation, PostgreSQL migration execution, RLS behavior, concurrent approval/posting and financial reconciliation remain pending. Unit, API, browser and mobile test suites remain deferred per project direction.
