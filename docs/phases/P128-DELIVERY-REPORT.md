# P128 Delivery Report

P128 adds accounting reporting and a safe journal-reversal foundation on top of P127.

## API additions
- `GET /accounting/general-ledger`
- `GET /accounting/fee-reconciliation`
- `GET /accounting/daily-summary`
- `GET /accounting/clearing-reconciliation`
- `POST /accounting/journals/:journalId/reverse`

All endpoints are mounted under the existing organization/school parent API namespace and use active school membership plus granular permissions.

## Permissions
- `accounting.reconcile`: Finance Officer and School Admin.
- `accounting.reverse`: School Admin only by default.

## Reversal behavior
- Original journal is never mutated.
- Reversal lines swap original debit and credit values.
- Reversal is posted through the shared balanced-journal service.
- Reversal posts into the current open accounting period.
- One reversal per original journal; repeat requests return the existing reversal.
- Reason and actor are recorded in audit metadata.

## Financial interpretation
The clearing endpoint compares internal records only. It must not be represented as bank reconciliation or confirmed settlement.
