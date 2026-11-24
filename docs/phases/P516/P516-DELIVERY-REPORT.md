# P516 Delivery Report — Receipts & Student Ledger

## Summary
P516 adds formal fee receipts and a student financial ledger without replacing P515 manual collection or accounting posting flows.

## Implementation
- `SchoolFeeReceiptCounter` provides tenant-scoped, transactionally incremented receipt sequence.
- `SchoolFeeReceipt` stores immutable receipt/payment/student/charge/invoice snapshot, payment method/reference, currency/amount/date, installment allocation snapshot, school name/code/timezone snapshot, issuer and issue time.
- API: list receipts, issue/idempotently return formal receipt by payment, receipt detail, student ledger.
- Receipt issuance refuses reversed payments, is tenant scoped, audited, and requires fee payment recording permission. Receipt reads require payment read permission.
- Finance UI can issue/print a numbered formal receipt; legacy quick print remains explicitly non-numbered. Student ledger UI displays event date/type/reference/description/debit/credit/running balance and currency summary.
- Ledger treats charge as debit, approved concession and payment as credit, settled refund as debit; balances are calculated in cents per currency. Invoice snapshots are not double-counted.

## Files changed
- `backend/api/prisma/schema.prisma`
- `backend/api/prisma/migrations/20261123150000_p516_fee_receipts/migration.sql`
- `backend/api/src/modules/parents/parent.routes.ts`
- `apps/school-admin/src/FinanceWorkspace.tsx`
- `scripts/verify-p516-fee-receipts-ledger.mjs`
- `docs/phases/P516/*`
- Root phase, remediation, README and gap-register documentation.

## Verification evidence
- Focused P516 verifier: 69/69 assertions pass.
- P510–P515 finance regressions pass.
- TS/TSX parser diagnostics: 0 for modified files.
- Archive CRC/SHA and cumulative comparison are documented in verification file.

## Acceptance limitations
No local Prisma CLI/dependencies are installed in the extracted workspace, so Prisma validation/generation and DB migration application were not executed. Runtime transaction concurrency, tenant/RBAC-negative, receipt print/browser, full build/typecheck and mobile/E2E acceptance are pending user-local validation.
