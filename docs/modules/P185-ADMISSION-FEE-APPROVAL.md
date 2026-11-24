# P185 — Admission Fee Finance Approval & Publishing Workflow

## Scope
Connect admission-generated draft fee charges to the existing student-fee approval and publishing lifecycle while preserving finance review controls.

## Source implementation
- `POST /fees/:chargeId/submit-approval` (school-scoped, `fees.manage`): transitions only `DRAFT` + `approvalStatus=DRAFT` charges to `PENDING_APPROVAL` using a conditional update.
- `POST /fees/:chargeId/approval-decision` (school-scoped, `fees.approve`): accepts `APPROVE` or `REJECT`, requires a rejection reason, blocks self-approval, and conditionally transitions only pending draft charges to `APPROVED` or `REJECTED`.
- Both transitions write audit-log events.
- Existing `PATCH /fees/:chargeId/publish` remains gated by `status=DRAFT` and `approvalStatus=APPROVED`; publishing invokes the existing accounting posting flow.

## API payloads
Submit for approval: empty JSON body.
Decision: `{ "decision": "APPROVE" }` or `{ "decision": "REJECT", "reason": "..." }`.


## Gaps / acceptance limits
- Finance UI for the new fee-charge approval actions is not yet connected.
- Existing permission grants for `fees.approve` must be reviewed and provisioned by role.
- API build, migration, automated tests and runtime acceptance are deferred per project instruction.
- Admission fee handoff -> charge creation is source-integrated, but full parent payment/receipt/reconciliation acceptance remains open.
