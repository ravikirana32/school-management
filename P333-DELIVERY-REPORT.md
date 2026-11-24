# P333 — Guardian Identity & Duplicate Applicant Review

## Cycle 1 scope delivered
- Added a staff-authorized guardian identity preflight endpoint for accepted admission applications.
- Preflight is scoped to organization and school, and requires admissions.manage.
- Existing guardian candidates are matched using normalized guardian email/phone; response identifies which contact fields matched and whether a guardian account is linked.
- When multiple guardian matches exist, conversion requires a staff-selected candidate. Server validates the selected ID is a current matching guardian in the same organization/school; invalid selection returns 400.
- A single candidate is suggested; no candidate means enrollment conversion creates a guardian record as before.
- Preflight also reports possible duplicate applicant applications when child name (normalized whitespace/case) and guardian contact match, excluding the current application. Result is bounded to 500 same-school application records and limited fields.
- Staff mobile admission conversion flow can fetch identity preflight, review/select guardian candidates, and display possible duplicate applications before enrolling.
- Existing conversion transaction and tenant scoping are preserved. Selection validation happens within the conversion transaction; invalid/ambiguous selection causes rollback.

## Verification
- TypeScript transpile syntax diagnostics: 0 for modified API route and staff mobile panel.
- Targeted source contract checks: 8/8 PASS.
- ZIP integrity / CRC: PASS.
- Baseline deletion check: 0 deletions.
- Full typecheck/build, live API/database integration, and device/E2E: not run (dependencies/runtime not present; full acceptance remains Cycle 2).

## Remaining related gap
Guardian account invitation, consent lifecycle, record merge/deduplication, and full duplicate-applicant resolution/merge workflows remain OPEN and are not claimed complete by P333.
