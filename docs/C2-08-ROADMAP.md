# C2-08 — Finance & Fee Management Roadmap

Cycle 2 implementation sequence. This is a phase plan, not a runtime acceptance statement.

| Phase | Focus | Planned scope | Status |
|---|---|---|---|
| C2-08-01 / P509 | Finance foundation | School finance configuration, default currency, fee categories, enabled payment methods, invoice/receipt prefixes, non-cash reference policy | **Completed — source/static checks** |
| C2-08-02 / P510 | Fee structure enhancements | Consume finance config categories/currency, stronger structures, component validation and scoped templates | **Completed — source/static checks** |
| C2-08-03 / P511 | Student fee assignment | Student/class/year assignment lifecycle, preview, idempotency and duplicate handling | **Completed — source/static checks** |
| C2-08-04 / P512 | Installments & schedules | Due dates, installments, schedule visibility and lifecycle | **Completed — source/static checks** |
| C2-08-05 / P513 | Discounts & concessions | Scholarship, concession, waiver and approval rules | **Completed — source/static checks** |
| C2-08-06 / P514 | Billing & invoices | Invoice generation, adjustments, numbering, document output, approved concession netting and invoice lifecycle | **Completed — source/static checks** |
| C2-08-07 / P515 | Fee collection | Invoice-linked payment recording, partial payments, configured payment methods, idempotent retries and installment allocations | **Completed — source/static checks** |
| C2-08-08 / P516 | Receipts & ledger | Persisted receipt generation, student ledger, transaction traceability and reversals | **Next** |
| C2-08-09 / P517 | Outstanding & late fees | Overdue balances, penalty policy, aging and outstanding workflows | Planned |
| C2-08-10 / P518 | Refunds & reconciliation | Refund/reversal lifecycle, reconciliation, idempotency and reporting | Planned |
| C2-08-11 / P519 | Parent mobile integration | Parent dues, invoices, payment history and receipt visibility | Planned |
| C2-08-12 / P520 | Consolidation | Finance dashboards/reports, integration gap remediation and phase consolidation | Planned |

## P509 carry-forward gaps

- Integrate configured fee categories into fee-structure components and fee-charge validation.
- Enforce configured payment-method enablement and non-cash reference policy in payment recording.
- Validate migration and RLS on clean PostgreSQL locally.
- Add runtime/API integration, tenant-negative and role-negative tests.
- Confirm configured prefixes and currency are consumed by invoice/receipt generation.

## User-run acceptance

Dependency installation, local builds, runtime checks, device checks and E2E acceptance are performed by the user locally. Development phases continue with source/static verification and clear disclosure of what has not been run.

## P514 delivered

- Invoice draft generation from published fee charges, with duplicate prevention.
- Approved concessions snapshotted into invoice totals and installment-aware lines.
- Invoice list/detail API and Finance UI; draft issue and reason-required void workflow.
- Tenant-scoped invoice tables and RLS. Source/static verification only.

## P515 delivered

- Invoice-aware manual payments; invoice net outstanding caps collection.
- School-enabled payment methods enforced and Finance collection UI dynamically populated.
- Matching payment-reference retries return the existing payment; mismatched retries conflict.
- Payments link to invoices and allocate oldest-first across installments, including net concession-adjusted targets.
- Persisted payment-installment allocation rows with tenant composite FKs and forced RLS.
- Invoice/charge/installment/schedule balances and statuses update transactionally.
- Payment history and receipt print include invoice and installment allocation details.
- Source/static checks only; local runtime acceptance remains pending.

## P513 delivered

- Charge-level fixed and percentage concession requests with calculated values.
- Tenant-scoped concession persistence and compound charge scope FK.
- Independent approval/rejection (`fees.approve`); requester self-approval blocked.
- Requests restricted to charges that remain in DRAFT state.
- Pending duplicate requests blocked; approved concession sum cannot exceed gross charge.
- Finance UI request/review panel displays gross, approved concession total, and calculated net amount.
- Gross charge is not mutated in P513; invoice lifecycle/netting is the P514 integration.
- Source/static verification only; local runtime acceptance remains user-run.
