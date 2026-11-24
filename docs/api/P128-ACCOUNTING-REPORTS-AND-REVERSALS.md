# P128 — Accounting Reports and Journal Reversals

All routes below are mounted under `/api/v1/:organizationId/:schoolId/parents` and require authentication, active school membership and the listed permission.

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/accounting/general-ledger` | `accounting.read` | Account-wise journal lines with date range, opening balances before the range, optional account filter and bounded limit |
| GET | `/accounting/fee-reconciliation` | `accounting.reconcile` | Published fee totals, recorded amounts paid and outstanding by student/currency |
| GET | `/accounting/daily-summary` | `accounting.reconcile` | Daily recorded collections and settled refunds, maximum 366 days |
| GET | `/accounting/clearing-reconciliation` | `accounting.reconcile` | Internal clearing ledger compared with recorded payments less settled refunds |
| POST | `/accounting/journals/:journalId/reverse` | `accounting.reverse` | Posts an opposite-sided journal into the current open period |

## Journal reversal contract

Request body: `{ "reason": "...at least 10 characters..." }`.

The original journal remains immutable. The service creates a new `REVERSAL` source entry with debit and credit sides swapped. The operation is serialized by an advisory transaction lock and idempotent per original journal. A reversal journal cannot itself be reversed. Reversal requires the current accounting period to be open.

## Financial interpretation and limitations

- Trial balance and general-ledger reports support date filters. Daily summaries are based on recorded payment rows and settled refund rows, not bank-confirmed settlement.
- Clearing reconciliation is an internal source-to-ledger comparison only; it does not ingest bank statements or provider settlement feeds.
- Fee outstanding is aggregated by student ID and currency without exposing student PII.
- Reports are bounded; full cursor pagination and external reconciliation are future work.
