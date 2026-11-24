# P130 — Historical fee transaction import

Apply this migration after P129. It creates tenant-scoped staging batches and rows for verified historical CHARGE, PAYMENT and REFUND source records.

- Each row preserves the source reference, student, original transaction date, amount, currency via its batch, payment method and refund settlement evidence.
- REFUND rows require an externally supplied settlement reference. The system does not initiate refunds.
- Batches are draft-only until independently approved. Approved rows are immutable; source type/reference pairs are unique across all batches for a school, and posting is transactional/idempotent through journal source keys.
- Posting creates immutable ledger journals with original transaction dates and does not recreate or mutate operational `StudentFeeCharge`, `StudentFeePayment` or `StudentFeeRefund` records.
- A historical date whose accounting period is closed cannot be posted. Reopen/adjustment policy must be approved by finance; the workflow never silently changes the accounting date.
- Historical reconciliation is a staging/subledger control report. It must be compared with approved opening schedules and signed source control totals before cutover.

Run with the normal Prisma migration deployment process. Runtime/RLS/trigger verification is pending; this README is not evidence of successful database execution.
