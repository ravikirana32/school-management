# P376 Status — Server-owned onboarding dependencies and recommendation (C2-04/F03)

## Implemented
- Onboarding readiness checks now return dependency metadata for each of the seven checks from the API.
- School Admin consumes server-provided dependency metadata, retaining fallback values for older response shapes.
- The readiness API returns `nextIncompleteKey`; the UI uses this recommendation when available and falls back safely.
- UI configure actions remain gated based on resolved readiness of the dependency checks.
- Updated source verifiers P371 and P372 to assert the new server-owned dependency contract instead of obsolete client-only literals.


## Validation
- P376 source contract verifier: 10/10 PASS.
- P375 remediation verifier: 10/10 PASS.
- P374 readiness verifier: 14/14 PASS.
- P373 persistence verifier: 12/12 PASS.
- P372 dependency gate verifier: 14/14 PASS.
- P371 step navigation verifier: 13/13 PASS.
- P370 guided onboarding verifier: 13/13 PASS.
- Runtime/build/typecheck/API database/mobile/E2E verification remains pending.

## Remaining F03 work
Server-persisted checklist progress/ownership and multi-user resume, invitation and assignment flows, setup writes with backend prerequisite enforcement, complete setup dependency orchestration, multi-campus inheritance/overrides, bulk configuration import/export preview/rollback, and runtime acceptance.
