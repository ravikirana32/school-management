# P516 Next Phase Tasks — Receipts & Student Ledger

1. Inspect existing receipt print flow and receipt numbering configuration.
2. Persist formal fee receipt records separate from payment reference.
3. Use school-configured receipt prefix and collision-safe sequence.
4. Receipt lifecycle for recorded payments; avoid duplicate receipt generation.
5. Include invoice number, student, charge, fee category, method, reference, date, amount and installment allocation details.
6. Add receipt detail/list API with tenant and `fees.payments.read` scope.
7. Add printable receipt template and school branding/configuration fields.
8. Student ledger view: charge, invoice, concession, payment, allocation, refund, running balance grouped by currency.
9. Support date range, student and charge filters, pagination.
10. Reconcile ledger running balances with invoice outstanding and operational charge/payment records; account for refunds without double-counting.
11. Parent/student portal groundwork for receipt download/list, coordinated with P519.
12. Add focused verifiers, run prior finance regressions, update gap register and deliver P516 cumulative ZIP/checksum/manifest.
