# P515 Next Phase Tasks — Fee Collection & Payment Processing
1. Audit invoice and charge/payment models from P514.
2. Add invoice-aware collection workflow with invoice-specific outstanding amount.
3. Integrate existing manual payment recording with invoice balances and invoice status.
4. Preserve charge-level accounting postings and prevent double posting.
5. Add partial payment, multiple invoice payment, overpayment prevention, duplicate reference and idempotency controls.
6. Allocate payments to installments; update installment amountPaid/status and due schedule state.
7. Support payment method, transaction reference, paid date, recorded-by and evidence metadata.
8. Integrate gateway initiation only where configured; do not simulate success.
9. Parent finance data/API integration groundwork, keeping gateway access/parent UI scope bounded.
10. Finance UI collection flow with invoice outstanding and allocation preview.
11. Tenant isolation, RBAC, audit and transaction/concurrency protection.
12. Focused verifiers/regressions, gap register update, cumulative ZIP and checksum.

Exit: charge, invoice, installment and accounting balances reconcile consistently; repeated requests cannot duplicate payment/allocation or overpay.
