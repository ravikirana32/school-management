# P532 Status — Admission-to-Enrollment Conversion Hardening

**Status:** Source implementation complete; focused assertions PASS.

- Hardened accepted-application conversion preconditions and tenant/school scope.
- Added idempotent response for conversion retries: HTTP 200 and existing student/admission number; first conversion remains HTTP 201.
- Added integrity conflict when the converted-student pointer references no scoped student.
- Active seat reservations require the reserved section to be selected and match; expired reservations are not treated as active.
- Section selection is validated for organization, school, academic year, grade, and section name.
- Reservation consumption guards enrolled-seat capacity and checks atomic update success.
- Non-reserved section enrollment retains compare-and-set capacity checks.
- Existing student, guardian, enrollment, status/stage history, and admission fee handoff flow remain intact.

## Verification

- P532 focused verifier: 19/19 PASS.
- P526–P532 combined focused source assertions: 140/140 PASS.
- Full builds, typecheck, DB/runtime, browser/mobile, accessibility, and E2E acceptance are not claimed.
