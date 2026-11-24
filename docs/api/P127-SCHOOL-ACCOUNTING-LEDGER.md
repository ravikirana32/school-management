# P127 — School Accounting Ledger

## Scope
P127 introduces a school-scoped chart of accounts, monthly periods and immutable double-entry journals. All accounting tables carry organization and school identifiers and use forced PostgreSQL row-level security. Journal entry/line history is append-only; corrections require a future reversal journal rather than mutation.

## Default chart
| Code | Account | Type | Normal balance |
|---|---|---|---|
| 1100 | Accounts Receivable | ASSET | DEBIT |
| 1110 | Cash / Bank Clearing | ASSET | DEBIT |
| 4000 | School Fee Revenue | REVENUE | CREDIT |

The first accounting initialization or posting creates these system accounts idempotently. This is a minimum posting chart, not a complete statutory chart of accounts.

## Posting rules
| Source event | Debit | Credit |
|---|---|---|
| Approved fee charge publication | 1100 Accounts Receivable | 4000 School Fee Revenue |
| Manual payment recorded | 1110 Cash / Bank Clearing | 1100 Accounts Receivable |
| Refund settlement evidence recorded | 1100 Accounts Receivable | 1110 Cash / Bank Clearing |

All values are normalized to paise before comparison. Each journal has at least two lines, exactly one side per line, and equal debit/credit totals. Source type + source ID is unique per school and protected by a transaction advisory lock.

## Endpoints
All endpoints are mounted under `/:organizationId/:schoolId/parents`.

- `POST /accounting/initialize` — requires `accounting.post`; creates the minimum chart and current monthly period.
- `GET /accounting/accounts` — requires `accounting.read`.
- `GET /accounting/journals?limit=50&periodId=...&sourceType=...` — requires `accounting.read`.
- `GET /accounting/periods` — requires `accounting.read`.
- `GET /accounting/trial-balance?periodId=...` — requires `accounting.read`.
- `POST /accounting/periods/:periodId/close` — requires `accounting.periods.manage`; closed periods reject new postings.

The seeded Finance Officer receives `accounting.read` and `accounting.post`, but not period-close permission. School Admin receives the complete permission catalogue.

## Operational constraints
- Journal entries and lines are immutable at the database layer. Do not update/delete them; post a separately authorized reversal journal in a future phase.
- Monthly periods are created lazily and default OPEN. The period must contain the posting date.
- Posting is part of the originating fee transaction; a posting failure rolls back the charge/payment/refund settlement transaction.
- Payment posting represents a recorded/manual receipt into a clearing account; it does not initiate a gateway transaction or prove bank settlement.
- Refund posting represents externally evidenced settlement recorded by an operator; it does not transfer funds.
- Pre-P127 fee charges/payments and opening balances are not backfilled. See P127-G002.
- Tax, discounts, waivers, scholarship, deferred revenue, bad debt, bank reconciliation, credit notes and statutory financial statements are outside this phase.

## Migration
`backend/api/prisma/migrations/20261118110000_p127_accounting_ledger/migration.sql` creates the four ledger tables, composite tenant constraints, RLS policies, period guard, append-only triggers and deferred balanced-journal checks. Migration execution is pending.
