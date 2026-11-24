# P396 Status — F03 School Configuration Transfer

**Status:** Complete for this source slice; F03 remains IN_PROGRESS.

## Implemented
- Added versioned JSON configuration transfer envelope (`school-saas-config`, v1).
- Export current configuration for the Profile, Weekly Working Days, and Policies tabs.
- Import validation is tab/scope-specific and rejects incompatible transfer files.
- Profile preview validation checks required display name, week-start range, and unknown field whitelist.
- Working-days preview validates seven distinct weekday indexes, boolean working-day flags, and time formats.
- Policies preview validates attendance/grading objects and numeric grading ranges.
- Import is previewed before applying; application is RBAC guarded.
- API writes use compensating rollback attempts to the captured local state on failure. This is best-effort rollback, not a database-atomic multi-resource transaction.

## Verification
- P396 source verifier: 15/15 PASS.
- P370–P396 regression sweep: all phase source verifiers PASS.
- TypeScript syntax scan: 248 files, 0 parse errors.
- Root package JSON parse: PASS.

## Limitations / not closed
- Academic year, term, calendar, and event configuration are not included in this transfer feature.
- Import currently covers only Profile, Working Days, and Policies.
- Cross-resource atomic commit is not guaranteed; compensating rollback can itself fail and will disclose this.
- Full TypeScript build, dependencies install, API/runtime, DB, browser, mobile, and E2E tests were not run.
- F03 remains IN_PROGRESS; F04 has not started.
