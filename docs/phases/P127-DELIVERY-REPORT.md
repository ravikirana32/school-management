# P127 Delivery Report

## Delivered source artifacts
- `backend/api/src/modules/billing/school-accounting-ledger.ts`
- `backend/api/prisma/migrations/20261118110000_p127_accounting_ledger/migration.sql`
- Prisma accounting models in `backend/api/prisma/schema.prisma`
- Fee charge/payment/refund journal hooks and accounting APIs in `backend/api/src/modules/parents/parent.routes.ts`
- Accounting permission and Finance Officer seed updates
- `docs/api/P127-SCHOOL-ACCOUNTING-LEDGER.md`
- `scripts/verify-p127-accounting-ledger.mjs`

## Transactional behavior
Each fee workflow writes its source record, accounting journal and existing audit records in the same Prisma transaction. Journal source uniqueness and an advisory transaction lock protect retries. A journal posting error rolls back the source transaction.

## Accounting treatment
Fee charge: Dr Accounts Receivable / Cr Fee Revenue. Payment: Dr Cash/Bank Clearing / Cr Accounts Receivable. Refund settlement: Dr Accounts Receivable / Cr Cash/Bank Clearing. These are baseline school fee postings only; account mapping and recognition policy require finance review before production use.

## Gap changes
- Updated P125-G003 and P126-G003 to reflect the newly implemented ledger source while retaining their remaining verification/integration work.
- Added P127-G001..G003.
- No gap was closed; runtime and migration evidence are not yet available.
- Root and `docs` master gap registers are byte-identical.
