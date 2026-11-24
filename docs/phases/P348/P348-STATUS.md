# P348 — Admissions Staff Mobile Functionality

**Status:** Cycle 1 source implementation complete; targeted verifier PASS.

## Baseline audit
The Staff Mobile Admissions panel already supports draft application creation, application stage transitions, document upload/download, eligibility checklist visibility, guardian matching and enrollment conversion, offer issue/respond, fee handoff, reservation release and expiry sweep. P347's admissions exception feed was present in School Admin but not surfaced in Staff Mobile.

## P348 implementation
- Added a school-scoped admissions exception feed to the Staff Mobile Admissions panel via the existing admissions API `GET /exceptions` route.
- Displays summary counts for total, high/medium, unassigned, overdue SLA, expired offers, expired reservations, and document issues.
- Displays up to 30 exception records with severity, type, application/offer reference, summary and due/expiry time.
- Refresh reuses existing admissions data load flow.
- Exception feed errors are isolated and shown separately, so exception-monitoring failures do not block loading the existing admissions workflows.
- No schema changes or new mutation/remediation actions.

## Verification
- Targeted source verifier: 9/9 PASS.
- Runtime API/database, staff mobile build/typecheck, device acceptance, and E2E are NOT run.

## Open gaps
- P348-G001 OPEN: Runtime/mobile build and physical device validation remain Cycle 2.
- P348-G002 OPEN: Exception actions are read-only; remediation remains in existing workflows and direct mobile deep links are deferred.
- P348-G003 OPEN: Cross-school isolation runtime validation and full E2E/regression coverage remain deferred.
