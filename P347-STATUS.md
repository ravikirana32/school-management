# P347 — Admissions Exception Monitoring

**Status:** Cycle 1 source implementation delivered; runtime validation OPEN.

## Delivered
- Added authenticated, admissions-read-permission-gated, school-scoped `GET /:organizationId/:schoolId/admissions/exceptions` endpoint.
- Normalized operational signals: active applications without reviewer, overdue review SLA, OFFERED offers past expiry, ACTIVE seat reservations past expiry, and rejected/quarantined admission documents.
- Summary counts by total, severity, and exception category; sorted HIGH before MEDIUM.
- School Admin Admissions workspace loads and renders exception summary and drillable row identifiers; refresh reloads feed. Remediation remains in existing workflows.
- Targeted static verifier: `scripts/verify-p347-admissions-exception-monitoring.mjs`.

## Verification
- Targeted source verifier: 10/10 PASS.
- Runtime DB/API and tenant-boundary testing: not run.
- Admin build/typecheck/browser E2E: not run.

## Open gaps
- No remediation actions or direct exception-to-application navigation added in this phase; use existing workflow areas.
- Notification delivery failures, fee handoff anomalies, capacity overbooking, and withdrawn cleanup are not included in this initial exception feed.
- Runtime/API permission and tenant isolation tests, build, browser/mobile and E2E remain Cycle 2.
