# P398 Status — Calendar and Event Configuration Transfer

**Status:** Source implementation complete for calendar transfer; F03 remains IN_PROGRESS.

## Delivered
- Added `calendar` to the versioned school configuration JSON transfer scopes.
- Export of the selected calendar's name and event records, including event type, start/end timestamps, all-day flag, instruction-day flag and audience.
- Validation requires calendar name and an events array (maximum 500); validates title, event type allowlist, timestamp ordering, optional boolean flags, audience type and duplicate title/start pairs within the file.
- Import preview shows validated content before applying.
- Apply requires `academics.manage` and creates a new calendar plus events, leaving existing calendars untouched. The import is additive and sequential; partial creation is possible if an API request fails.
- Existing selected-calendar state is refreshed after import; selection moves to the newly created calendar.
- Updated the P396 verifier to accommodate the calendar scope's specific academic-management permission.

## Verification
- P398 verifier: 18/18 PASS.
- P397 verifier: 20/20 PASS.
- P396 verifier: 15/15 PASS.
- P370–P398 phase verifier sweep: all discovered verifiers PASS.
- TypeScript/TSX syntax scan: 248 files, 0 parse errors.
- Package JSON parse: PASS.
- Cumulative ZIP integrity and P397 baseline preservation: PASS.

## Limitations / not run
- Full build/typecheck, API runtime, database integration, browser/mobile/E2E tests were not run.
- Calendar import is sequential/non-transactional; partial creation can occur after a failed request.
- Transfer scope is limited to the selected calendar; no multi-calendar bulk transfer, calendar mutation/merge, or atomic rollback.
- Multi-campus inheritance/overrides and full F03 setup orchestration remain open.
- **F03 remains IN_PROGRESS; F04 remains blocked.**
