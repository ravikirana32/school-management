# P251 Delivery Report — Primary Photo Replacement Safety

## Implemented
- Student-photo deactivation API now returns HTTP 409 and a clear instruction when the target is still the current primary photo.
- Admin deactivation control is disabled for the current primary photo.
- Replacement instructions enforce the safe sequence: upload → CLEAN scan → set replacement as primary → deactivate prior photo.
- Existing primary-selection endpoint behavior remains the replacement designation step.

## Verification
- Static source assertions: 10/10 passed.
- Root/docs mirror checks: 6/6 passed.
- Cumulative ZIP integrity: passed.
- Runtime build/typecheck/API/UI/mobile/E2E/security and DB migrations: deferred to final validation.
- Master gaps closed: 0.

## Student Lifecycle
Functionality 1 — Student Records & Profiles remains in progress. P251 adds API and UI safeguards for photo replacement. Remaining work includes lifecycle/retention controls, replacement UX refinements, profile and medical UX refinements, and final runtime validation.

## Next
P252 continues Functionality 1 with photo lifecycle and retention controls, including clearer active/deactivated state and safe operation guidance.
