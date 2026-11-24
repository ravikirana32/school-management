# P278 Status — Finance & Expenses

Implemented expense capture and an approval lifecycle in the cumulative P277 baseline.

## Delivered
- SchoolExpense model and SQL migration with tenant RLS/FORCE RLS policy.
- School-scoped expense list, draft create, submit, approve and reject endpoints.
- Expense number uniqueness per school, amount/date/currency/category validation.
- State transitions: DRAFT -> SUBMITTED -> APPROVED or REJECTED; REJECTED may be resubmitted.
- Separate granular permissions for expense read/manage/approve.
- Creator cannot approve their own expense; rejection requires a reason.
- Audit events for creation, submission, approval and rejection.
- School Admin Finance workspace expense UI.
- Approved expenses remain unposted; accounting posting and expense reporting are P279 scope.

## Verification
- Static implementation assertions: 11 checks (see `scripts/verify-p278-school-expenses.mjs`).
- TypeScript/TSX syntax transpilation: modified files only.
- ZIP integrity checked after packaging.
- Prisma generation/migration execution and runtime API/database/browser/mobile E2E not run: dependencies unavailable.

## Open gaps
- P278-VAL01: Execute Prisma migration and schema validation; run API typecheck/build and expense API tests with dependencies/database.
- P278-G001: Approved expense ledger posting with balanced journal and idempotency (P279).
- P278-G002: Attach invoice/receipt documents and secure evidence lifecycle.
- P278-G003: Expense history, editing rules, void/reversal workflow and period controls.
