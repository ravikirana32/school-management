# P240 Delivery Report — Capacity-aware Student Enrollment UI

## Scope
Connected the existing student enrollment form to configured section-capacity data for the selected academic year and grade.

## Source changes
- Students workspace loads admissions capacity data via the school-scoped admissions capacity API (capacity retrieval is isolated so it does not prevent the student workspace from loading when unavailable).
- Configured section options are filtered by academic year and grade and display available seats, computed as capacity minus enrolled and reserved seats.
- Sections with no seats are disabled in the selector.
- Grade selection clears any stale section selection.
- When no matching capacity configuration exists, the legacy free-text section entry remains available.

## Validation
- Static source assertions performed.
- Builds, typechecks, runtime/API tests, migrations, mobile builds and E2E validation intentionally deferred per project instruction.
- Root/docs checklist and gap-register/history mirrors synchronized.
