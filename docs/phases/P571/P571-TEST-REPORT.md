# P571 Test Report

## Executed

| Check | Result | Meaning |
|---|---:|---|
| P571 integration assertions | 36/36 PASS | Source/inventory and preservation assertions |
| Prisma migration file inventory | 158 directories; 0 missing `migration.sql` | File presence only; no SQL execution |
| Full repository static verifier suite | 328/357 PASS; 29 FAIL | Historical/workspace verifier suite not clean |
| P569/P570 focused verifiers | PASS within full suite | Both phase verifiers are included and passed |
| ZIP CRC | PASS for both archives | Archive integrity |
| Deep archive manifest | PASS for both archives | File sizes/hashes matched manifest |

## Failed static verifier IDs (29)

- `verify-c2-01-ci-source.mjs`
- `verify-c2-01-package-manifests.mjs`
- `verify-c2-01-workspace.mjs`
- `verify-p119-api-auth-coverage.mjs`
- `verify-p120-tenant-authorization.mjs`
- `verify-p125-financial-authorization.mjs`
- `verify-p131-historical-operationalization.mjs`
- `verify-p277-fee-collection-ui.mjs`
- `verify-p283-teacher-announcements.mjs`
- `verify-p396-school-config-transfer.mjs`
- `verify-p397-academic-year-config-transfer.mjs`
- `verify-p398-calendar-config-transfer.mjs`
- `verify-p446-alert-sla-automation.mjs`
- `verify-p447-alert-sla-policy-atomicity.mjs`
- `verify-p454-c2-03-route-security-inventory.mjs`
- `verify-p455-handler-security-review.mjs`
- `verify-p456-route-middleware-order.mjs`
- `verify-p462-auth-runtime-verification-foundation.mjs`
- `verify-p463-auth-integration-test-foundation.mjs`
- `verify-p464-auth-negative-path-validation.mjs`
- `verify-p480-parent-canteen-health-wellbeing.mjs`
- `verify-p485-student-assessments.mjs`
- `verify-p488-student-services-hub.mjs`
- `verify-p490-student-cycle-closure.mjs`
- `verify-p498-integration-closure.mjs`
- `verify-p501-lockfile-readiness.mjs`
- `verify-p502-compilation-remediation.mjs`
- `verify-p504-backend-build-stabilization.mjs`
- `verify-p537-c2-09-cycle-closure.mjs`

The raw console output is in `P571-STATIC-VERIFIERS.log`. Several failures report missing parent-mobile verifier targets and workspace/manifest mismatches; others report historical source-contract assertion mismatches. They are not treated as P571 passes.

## Not run / blocked
- pnpm install and lockfile generation (pnpm unavailable; no lockfile in baseline).
- Prisma format, validate and generate (Prisma CLI/dependencies unavailable).
- PostgreSQL clean install and upgraded migration runs (Docker/database unavailable).
- Dependency-backed semantic typechecks and production builds (workspace dependencies absent).
- API/database integration and production-role RLS/cross-tenant negative tests.
- Transaction/concurrency/load tests for reservation, transport seat, hostel bed/waitlist, payments, refunds, shifts and worker idempotency.
- Real provider webhook/delivery/payment settlement E2E.
- Browser/device/mobile offline and accessibility E2E.
- Independent privacy/security/legal review.

These are recorded as P571-G001–G012 and remain open.
