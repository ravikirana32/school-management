# P521 Status — Finance Server-Side Aggregation & Acceptance Remediation

**Status:** Complete (source implementation and focused verification)
**Baseline:** P520

## Delivered
- Tenant/school-scoped `GET /accounting/finance-summary`, permission gated by `accounting.reconcile`.
- Server-side grouped totals by currency for published fee charges, approved concessions, invoices, payments and refunds.
- Approved concessions aggregated per charge before joining, avoiding duplicate-charge multiplication.
- Draft/void invoices excluded; reversed payments excluded; refund lifecycle states separated.
- Integer minor-unit arithmetic for summary calculations.
- Configuration readiness indicators: enabled payment method count, receipt-prefix configured, late-fee policy enabled; late fees remain preview-only.
- FinanceWorkspace server summary panel, refresh action and aggregated CSV export. Legacy P520 bounded snapshot retained and caveated.

## Verification
- P521 focused verifier: 33/33 PASS.
- P510–P520 finance regression scripts: all PASS.
- TypeScript/TSX parser syntax diagnostics: 0 for changed files.
- 42 master-gap-register copies synchronized and byte-identical.
- Cumulative archive comparison, ZIP CRC, manifest hashes and SHA-256 verified.

## Acceptance limitations
- Prisma CLI/schema validation and live PostgreSQL query execution were not run because dependencies/runtime DB are unavailable in this workspace.
- Tenant-negative/RBAC runtime tests, query-plan/load acceptance, full app typecheck/build, browser, accessibility, mobile and E2E remain open.
- Aggregated operational outstanding is charge gross less approved concessions and charge-recorded payments; not bank statement reconciliation or fully reconciled posted ledger balance.
