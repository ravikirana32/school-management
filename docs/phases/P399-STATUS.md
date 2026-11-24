# P399 Status — Strict ISO 8601 Calendar Event Timestamps

**Status:** Source implementation complete; F03 remains IN_PROGRESS.

## Delivered
- Calendar event configuration imports now require ISO 8601 date-time timestamps with an explicit timezone (`Z` or numeric offset).
- Added strict parser that validates calendar-date components, clock values, and timezone offset ranges before returning a parsed timestamp.
- Prevents permissive `Date.parse` acceptance of date-only values, timezone-less local date-times, rollover dates, invalid clocks, and malformed offsets.
- Existing calendar event ordering check now compares validated timestamp values.
- Added `verify:p399` package script and behavior verifier.


## Verification
- P399 strict timestamp verifier: 15/15 PASS.
- P398 calendar-transfer regression: 18/18 PASS.
- P397 academic-year transfer verifier: 20/20 PASS.
- P396 school-config transfer verifier: 15/15 PASS.
- P370–P399 discovered verifier sweep: 30/30 scripts PASS.
- TypeScript/TSX syntax scan: 248 files, 0 parse errors.
- Package JSON parse: PASS.

## Limitations / not run
- Full build/typecheck, API runtime, database, browser/mobile and E2E tests not run.
- Calendar imports remain sequential and non-transactional; partial creation can occur.
- Multi-campus inheritance/overrides, broad transfer domains, complete dependency orchestration and runtime acceptance remain open.
- F03 remains IN_PROGRESS; F04 remains blocked.
