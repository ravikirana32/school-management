# P132 Historical Financial Controls API

All routes are scoped to the authenticated organization and school and require `accounting.reconcile` unless noted.

- `POST /:organizationId/:schoolId/parents/accounting/historical-imports` accepts optional `declaredTotals: { charges, payments, refunds }`. If supplied, all three are required, non-negative and must exactly match the corresponding source rows to the paise.
- `GET /:organizationId/:schoolId/parents/accounting/historical-imports/control-reconciliation` returns computed totals, declared totals, whether totals were supplied, whether they match, and unverified/mismatched batch counts.
- `GET /:organizationId/:schoolId/parents/accounting/historical-imports/opening-overlap` returns student/currency historical and opening net amounts with a possible-overlap flag.

Approval rechecks declared totals before transitioning the batch. These controls do not establish source authenticity. Opening-overlap results are review signals only and do not change balances or block posting. Finance must compare as-of dates and source coverage and document a decision. No external statement integration is provided.
