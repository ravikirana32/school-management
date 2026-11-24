# P124 — Attendance, Timetable and Academic Resource Authorization

**Status:** Source implementation complete; runtime acceptance pending.

## Implemented
- Corrected teacher attendance-session listing so assignment effective dates are evaluated against the requested session date in the `TeacherAssignment` query, while the `AttendanceSession` query uses only fields that belong to that model.
- Restricted non-admin attendance-history reads to active staff with a currently effective assignment matching an active student enrollment in the requested school, academic year, grade and section.
- Passed the attendance session's academic year and session date into teacher correction-request authorization, preventing a current assignment in another academic year from authorizing a correction request against an unrelated session.
- Preserved administrator access through the existing attendance-management authorization path.
- Reviewed teacher self-timetable scope: active staff identity, active assignments, assignment effective dates, active slots and slot effective dates remain enforced. Timetable administration remains restricted to school administrators or `academics.manage`.

## Gap handling
- Updated P121-G003 and P122-G003 to reflect the attendance source changes and remaining historical/substitute-teacher policy work.
- Added P124-G001 through P124-G003.
- No gaps closed: runtime, API and database evidence is still required.
- Root and `docs` master gap registers are byte-identical.

## Verification performed
- `pnpm verify:p124`: 19/19 source checks passed.
- TypeScript syntax transpilation: 0 diagnostics in the two changed route files.
- Root/docs gap-register parity: PASS.
- Unit, API, browser and mobile test creation/execution remains deferred per project instruction.

## Not verified
- Prisma semantic validation and database runtime behavior.
- API runtime authorization, cross-school denial and non-owner RLS behavior.
- Semantic TypeScript typecheck and production builds.
- Substitute/cover-teacher policy and historical attendance access.
