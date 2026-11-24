# P517 Status — Outstanding Balances & Late-Fee Preview

**Status: Source implementation complete; focused static verification passed.**

- Added tenant-scoped, permission-gated `GET /fees/outstanding` with student filter and bounded results.
- Computes outstanding per charge using published charge amount, approved concessions and recorded payment amount; reports aging buckets and currency totals.
- Added school-scoped late-fee policy configuration (`PUT /fees/late-fee-policy`) for fixed/percentage, grace days, optional cap and currency.
- Late fees are **preview-only**. Policy defaults disabled; no assessment, accounting posting or automated charging occurs.
- Finance UI displays aging and preview and includes policy form behind `fees.manage`.
- Migration adds policy table, non-negative checks and forced tenant RLS.

Next: P518 Refunds & Reconciliation.
