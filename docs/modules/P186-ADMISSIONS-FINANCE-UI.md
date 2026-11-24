# P186 — Admissions Fee Finance UI Integration

## Scope
Connect the existing fee-charge approval and publishing API lifecycle to the School Admin Finance workspace, including admission-created charges.

## Source changes
- FinanceWorkspace loads fee charges using the existing school-scoped `GET /fees?limit=100` API, gated by `fees.read`.
- Displays charge title, amount/currency, student ID, category, charge code, due date, lifecycle state and approval state.
- `fees.manage` users can submit DRAFT/DRAFT charges for approval.
- `fees.approve` users can approve or reject pending drafts; rejection requires a reason.
- `fees.manage` users can publish approved draft charges; publishing invokes the existing endpoint and accounting posting flow.
- Actions refresh data and surface errors/messages.

## Lifecycle
`DRAFT/DRAFT -> PENDING_APPROVAL -> APPROVED or REJECTED -> PUBLISHED`

The UI does not override server-side permissions, tenant/school scope, self-approval restrictions, or conditional lifecycle checks.

## Verification limits
Source edits and archive packaging only. Build, automated tests, migration/runtime and role provisioning verification are deferred.

## Remaining gaps
- Review/provision role grants for `fees.approve` and confirm separation-of-duties.
- Complete admission fee payment, receipt and parent communication flow.
- Full fee reconciliation acceptance.
- Build/API/UI runtime acceptance.
