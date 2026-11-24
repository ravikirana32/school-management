# P515 Delivery Report — Fee Collection & Payment Processing

## Baseline
P514 cumulative ZIP verified by SHA-256 and ZIP CRC before extraction. P515 preserves the baseline and adds the payment allocation model/migration, invoice-aware collection route changes, Finance UI payment configuration and allocation visibility, verifier and phase documentation.

## Delivered
- Manual payment route validates amount precision, payment method, reference and date.
- School-configured enabled payment methods are enforced in API and loaded into the Finance UI selector.
- Tenant-qualified charge advisory lock and safe matching-reference retry return existing payment; mismatched duplicate details conflict.
- Linked invoice must be payable; invoice net outstanding caps collection, preventing collection above concessions-adjusted amount.
- Payment record can link to invoice; invoice outstanding/status and charge paid/status update in same transaction as payment and journal posting.
- Payments automatically allocate oldest installment first; split across installments when necessary.
- Invoice line net amounts are used as installment caps when source installment IDs exist.
- Pre-P515 payment balances are reconciled into installment paid amounts without fabricating historical allocation rows.
- New immutable payment-to-installment allocation model, composite tenant FKs, unique payment/installment pair, positive amount check and forced tenant RLS.
- Finance UI collection amount cap/default uses invoice outstanding; blocks collection while invoice is draft; shows configured payment methods, invoice link and allocation details in history and invoice number in printed receipt.

## Focused verification
- P515 focused verifier: **45/45 PASS**.
- P509–P514 regressions: **all six phase verifier scripts passed**.
- Backend route TypeScript syntax parse: **0 diagnostics**.
- Finance workspace TSX syntax parse: **0 diagnostics**.
- Payment allocation arithmetic scenarios: partial, cross-installment, full reconciliation, concession cap and idempotent retry checked.

## Not executed
Prisma schema validation/generation, database migration apply, runtime API integration, workspace typecheck/build, browser, mobile/device and E2E checks require the user's local environment and remain pending.
