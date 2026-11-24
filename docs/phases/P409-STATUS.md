# P409 Status — Campus-Effective Configuration Context in School Admin

**Status:** COMPLETE (source slice)
**F03:** IN_PROGRESS; F04 remains BLOCKED.

## Delivered
- Added active campus registry loading to the School Configuration workspace.
- Added campus selector, defaulting to main campus (or first active campus).
- Selected campus loads the persisted effective campus configuration API.
- Read-only preview displays inheritance chain and resolved profile/working-days/policies JSON.
- Loading/error states and stale-request cancellation guard are included.
- School-level edit/save flows remain unchanged; no campus override editing or writes are introduced in this phase.

## Verification
- P409 focused verifier: 11/11 PASS.
- P407 verifier: 20/20 PASS.
- P408 verifier: 15/15 PASS.
- Changed TSX source: 0 parse diagnostics.
- Package JSON: valid.
- Full cumulative TS/TSX scan: 252 files; 1 diagnostic in pre-existing baseline-AdmissionsWorkspace.tsx (not introduced by P409).
- Full build/typecheck and live API/database/browser/mobile/E2E tests not run.

## Remaining
Campus effective settings are preview-only and not yet applied to normal config writes. Mobile campus selection, concurrency/transaction safety, import rollback, remaining onboarding orchestration and full runtime acceptance remain open.
