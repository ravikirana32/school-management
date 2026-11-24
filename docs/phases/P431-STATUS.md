# P431 — Teacher Cohort Definition & Aggregate Privacy Safeguards

## Delivered
- P431 aggregate reporting cohort is now restricted to active staff whose active school designation has `isTeachingRole=true` and who have linked user accounts.
- Uses organization/school scoped designation and staff queries.
- Applies minimum aggregate cohort size of 5. Below threshold, returns only `suppressed`, threshold, and a generic reason; no staff or preference metrics are returned.
- UI displays privacy suppression messaging instead of metrics for suppressed cohorts.
- Updated P430 verifier to reflect changed privacy-safe response contract.

## Verification
- P431 focused verifier: 15/15 PASS.
- P430 verifier: 17/17 PASS.
- P429 verifier: 27/27 PASS.
- P428 verifier: 21/21 PASS.
- P427 verifier: 18/18 PASS.
- P426 verifier: 26/26 PASS.
- TypeScript transpile syntax diagnostics: 0 for changed API routes and React workspace.
- Full build/typecheck, live DB, migration/RLS runtime, authorization tests and browser/mobile E2E not performed.

## Gaps carried forward
- Review aggregate disclosure risk and threshold policy with school operators/privacy stakeholders.
- Full dependency-backed build and typecheck; runtime DB/migration/RLS/API acceptance; browser/mobile E2E.
- Provider-based push/email delivery, retries/backoff, receipts and observability.
