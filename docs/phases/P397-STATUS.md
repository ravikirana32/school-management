# P397 Status — Academic Year and Term Configuration Transfer

**Status:** Complete for the implemented source slice. F03 remains IN_PROGRESS.

## Delivered
- Added academic-year JSON configuration transfer scope.
- Export now retrieves terms for each existing academic year and includes their term fields.
- Import preview validates 1–20 years, required name/code, duplicate year codes, date ranges, term shape, required fields, duplicate term codes/sequences, term types, and term date boundaries inside each academic year.
- Preview rejects academic-year codes already present in the selected school.
- Apply is guarded by `academics.manage`, creates years and nested terms via API POST, and never makes imported years current.
- Apply is additive: existing academic years are not modified. Creation is sequential; if an API request fails, earlier records may already exist. UI warns the user to reload/reconcile before retrying.
- Updated P396 verifier to recognize the tab-specific permission check.

## Verification
- P397 source verifier: 20/20 PASS.
- P396 verifier: 15/15 PASS.
- P370–P397 regression verifier sweep: 28 phase verifiers PASS.
- TypeScript syntax scan: 248 files, 0 parse errors.
- Root package JSON parse: PASS.
- Cumulative ZIP integrity and P396 baseline preservation: PASS.

## Not run / limitations
- Full TypeScript build/typecheck, install, API runtime, database integration, browser/mobile/E2E were not run.
- Academic import is sequential and non-transactional. Partial records may exist after failure.
- Calendar/event import, cross-domain atomic transaction, multi-campus inheritance/overrides, and complete F03 orchestration remain open.
