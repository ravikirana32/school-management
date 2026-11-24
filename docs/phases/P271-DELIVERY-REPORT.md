# P271 — Attendance Reports Delivery Report

## Scope
Added basic daily attendance reporting to School Admin's AttendanceWorkspace. Report fetches attendance sessions for the selected date and loads each session roster from the existing authenticated school-scoped API.

## UI output
- Session count and roster entries
- Marked entries and presence-equivalent rate
- Counts by attendance status (PRESENT, ABSENT, LATE, HALF_DAY, EXCUSED, LEAVE)
- Per-session grade/section/status/roster/marked/present/absent/late/rate table
- Student-level status list with UNMARKED shown explicitly

## Calculation
Presence-equivalent rate treats PRESENT, LATE, and HALF_DAY as present-equivalent and divides by recorded marks only. Unmarked students are excluded. Per-session rate uses the same rule.

## Verification limits
Static source checks only. Runtime/build/typecheck/API/browser/mobile/E2E tests were not run. No gaps were closed because execution evidence is deferred.

## Remaining gaps
- P271-G001: Runtime/build/API/browser/mobile validation.
- P271-G002: Historical date-range reporting, trend analytics and export (Cycle 2).
