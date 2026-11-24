# P374 Delivery Report

## Scope
C2-04 / F03: consolidate school onboarding readiness into a tenant-scoped server endpoint and switch the admin onboarding UI to consume it.

## Implementation
- API: `backend/api/src/modules/schools/school-config.routes.ts`
- UI: `apps/school-admin/src/OnboardingWorkspace.tsx`
- Contract verifier: `scripts/verify-p374-server-onboarding-readiness.mjs`
- Package script: `verify:p374`

## Outcomes
The API returns seven server-derived readiness checks and summary metrics. The UI maps the returned checks to the existing guided setup items and no longer independently computes completion from separate payloads.

## Acceptance
- Source contract verifier: 14/14 PASS.
- Build, runtime, live DB/API integration, browser/mobile E2E: NOT RUN / NOT VERIFIED.
- No schema migration added.

## Baseline preservation
P374 cumulative archive is generated from the P373 work tree; baseline files and previous phase documentation are retained.
