# P526 — Admissions Foundation & Configuration

## Delivered
- Added tenant/school scoped `GET /:organizationId/:schoolId/admissions/foundation` endpoint.
- Endpoint requires active school membership, `admissions.read`, and Admissions subscription entitlement through the shared scope helper.
- Snapshot includes school academic years, active grade levels, supported board codes, application workflow status metadata, counts, and setup-readiness indicators.
- Added School Admin Admissions Foundation overview consuming the endpoint, displaying setup counts, supported boards, status flow, and readiness signals.
- Existing application, eligibility, capacity, and admission workflows retained.


## Focused verification
- `scripts/verify-p526-admissions-foundation.mjs`: 18/18 source assertions PASS.

## Limitations
- Source-level verification only. API typecheck/build, DB-backed endpoint behavior, tenant-negative runtime tests, UI/browser/mobile validation and E2E acceptance remain pending.
