# P389 — F03 Invitation Management Lifecycle Slice

**Status:** Source implementation completed; F03 overall remains IN_PROGRESS.

## Scope delivered
- Organization Admin now has an invitation management UI to create invitations, list invitations, display derived status, and revoke pending invitations.
- Organization API adds an admin-gated invitation list endpoint. It returns only safe fields and never exposes token hashes or raw tokens.
- Organization API adds an admin-gated revoke endpoint with audit logging.
- Invitation creation rejects an existing active pending invitation for the same normalized email, role, and school scope.
- Acceptance attempts serialize by token hash using a transaction advisory lock; scoped role assignment is checked before creating a duplicate; invitation consumption uses a conditional update.
- The UI explicitly reports the existing limitation: delivery provider configuration is absent, so invitations remain pending delivery.

## Verifications
- P389 source verifier: 15/15 PASS.
- P370–P388 regression verifiers: all PASS.
- TypeScript syntax scan: 247 files, 0 parse errors.
- Workspace package audit: 13 packages, 0 manifest/dependency/script errors.
- Runtime database, API build/runtime, and browser E2E not run because dependencies/bootstrap are unavailable in this working environment.

## F03 closure decision
F03 is **NOT CLOSED** in P389. Remaining work includes invitation delivery adapter/outbox and acceptance UX, server-side setup prerequisite enforcement across mutation routes, full configuration orchestration, multi-campus inheritance/overrides, bulk import preview/validation/rollback, and runtime acceptance. F04 must not start yet.
