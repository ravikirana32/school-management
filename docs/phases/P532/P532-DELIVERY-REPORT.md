# P532 Delivery Report

## Objective
Harden conversion from an accepted admission application into a student enrollment against retries, invalid state, section/reservation mismatch, capacity races, and tenant-scope issues.

## Source changes
- Updated the admissions conversion route to query the application within organization/school scope before state checks.
- Implemented idempotent retry behavior when `convertedStudentId` is already populated: safely reload the scoped student and return `idempotent:true` with HTTP 200.
- Added a stable integrity error if the converted student record cannot be found in the application tenant/school.
- Conversion is allowed only from `ACCEPTED` status.
- Active reservations require a section selection and that section must match the reservation capacity. Reservation consumption is guarded by current capacity and update success.
- Explicit section lookup is scoped to organization, school, academic year, and grade; invalid section selection returns a stable code.
- Non-reserved capacity updates continue to use compare-and-set.
- Preserved the transaction's student creation, guardian link, enrollment, status/stage history, and fee-handoff ledger integration.
- Added `scripts/verify-p532-admission-enrollment-conversion.mjs`.

## Evidence
- P532 verifier: 19/19 PASS.
- P526: 18/18; P527: 20/20; P528: 21/21; P529: 22/22; P530: 25/25; P531: 15/15.
- Combined P526–P532: 140/140 PASS (source assertions).

## Limitations
No full API/admin/mobile build, typecheck, PostgreSQL integration/runtime, tenant-negative runtime test, browser/accessibility test, or E2E acceptance is claimed. These remain tracked in the master open-gap register.
