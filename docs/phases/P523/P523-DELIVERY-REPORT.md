# P523 Delivery Report

## Finance reconciliation date windows and drill-down

P523 extends the P522 source-to-journal reconciliation endpoint with validated inclusive date filtering and bounded transaction details.

### Date semantics
- Operational payments: `paidAt`
- Settled refunds: `settledAt`
- Posted journals: `postingDate`

The endpoint rejects malformed dates, impossible calendar dates and reversed ranges. The date boundaries are passed as parameterized Prisma SQL fragments. Date semantics are intentionally surfaced because transaction and posting dates may not coincide, creating timing variances.

### Drill-down
- Up to 100 non-reversed operational payment rows with payment ID, student, reference, method, date and amount.
- Up to 100 settled refund rows with refund/payment IDs, settlement reference, date and amount.
- Up to 200 posted fee payment/refund journal lines with entry number, source type/source ID, account code/name, date, debit and credit.
- School/organization tenant scope and `accounting.reconcile` permission preserved. No write/posting operation added.

### Validation
- P523 focused verifier: 16/16 PASS.
- P522 verifier regression: 19/19 PASS.
- TypeScript/TSX parser diagnostics: 0 for changed files.
- Runtime PostgreSQL, build/typecheck, browser/mobile and E2E acceptance remain OPEN.
