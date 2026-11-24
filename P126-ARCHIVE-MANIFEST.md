# P126 Cumulative Archive Manifest

- Baseline: `school-management-saas-P125-cumulative.zip`
- Delivery: cumulative source and documentation through P126; all prior paths retained.
- Baseline entries: 1,251
- P126 entries: 1,262
- New paths: 11
- Modified existing paths: 7
- Missing previous paths: 0
- Archive verification: see `P126-ARCHIVE-VERIFICATION.txt`

## New paths

- `P126-STATUS.md`
- `P126-DELIVERY-REPORT.md`
- `P126-TEST-REPORT.md`
- `P126-ARCHIVE-MANIFEST.md`
- `P126-ARCHIVE-VERIFICATION.txt`
- `backend/api/prisma/migrations/20261118100000_p126_fee_refunds/migration.sql`
- `docs/api/P126-FEE-REFUND-LIFECYCLE.md`
- `docs/phases/P126-STATUS.md`
- `docs/phases/P126-DELIVERY-REPORT.md`
- `docs/phases/P126-TEST-REPORT.md`
- `scripts/verify-p126-fee-refunds.mjs`

## Modified existing paths

- `CHANGELOG.md`
- `MASTER-OPEN-GAPS-REGISTER.md`
- `backend/api/prisma/schema.prisma`
- `backend/api/prisma/seed.ts`
- `backend/api/src/modules/parents/parent.routes.ts`
- `docs/MASTER-OPEN-GAPS-REGISTER.md`
- `package.json`

## Gap register snapshot

- Unique gap IDs: 778
- Explicit statuses: 769
- OPEN: 437
- IN_PROGRESS: 2
- PARTIALLY_IMPLEMENTED: 111
- READY_FOR_VERIFICATION: 205
- BLOCKED_EXTERNAL: 14
- CLOSED: 0
- Legacy IDs without normalized status: 9

No gap was closed in P126 because database/runtime evidence has not been produced. P125-G003 was updated to `PARTIALLY_IMPLEMENTED`; P126-G001 and P126-G002 are `READY_FOR_VERIFICATION`; P126-G003 remains `OPEN`.
