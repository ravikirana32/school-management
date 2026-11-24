# P514 Next Phase Tasks — Billing & Invoice Lifecycle

1. Audit current draft/published fee charges, approved concessions and installment schedules.
2. Add invoice persistence and school-scoped invoice numbering/prefix consumption.
3. Invoice preview/generation per student and billing period.
4. Net amount = gross charge minus approved concessions; guard negative totals.
5. Invoice itemization by fee category/component and concession details.
6. Attach installment due schedule and invoice lifecycle states.
7. Invoice approval/publication controls, immutable published invoices.
8. Prevent double invoice generation/idempotency.
9. Reversal/void handling with audit trail; do not delete financial history.
10. Parent-facing invoice document/data API foundation (mobile exposure follows P519).
11. Finance UI invoice preview, generation, status, details and print/export.
12. Integrate accounting journal/ledger posting appropriately.
13. Focused P514 verifier, P509–P514 regressions, reports and cumulative archive verification.

**P514 must integrate P513 approved concessions.** P513-G003 remains open until billing netting is implemented and verified.
