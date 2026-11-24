# P390 Delivery Report — F03 Backend Setup Prerequisite Enforcement

## Delivered
- Added reusable server-side onboarding prerequisite lookup inside tenant-scoped configuration transactions.
- Academic term creation now requires the selected academic year to be current and ACTIVE, in addition to existing range validation.
- Calendar creation requires a complete school profile and active current academic year. If an academic year is attached, it must be the active current year.
- Working-day configuration writes require a complete school profile.
- School policy writes require a complete school profile and active current academic year.
- Unmet prerequisites are returned as conflict errors (409) with remediation-oriented messages.
- Added source contract verifier and package script `verify:p390`.

## Verification
- P390 verifier: 10/10 PASS.
- P372 verifier: 18/18 PASS.
- P374 verifier: 16/16 PASS.
- P375 verifier: 10/10 PASS.
- P376 verifier: 10/10 PASS.
- P377 verifier: 12/12 PASS.
- P378 verifier: 20/20 PASS.
- P380 verifier: 13/13 PASS.
- P381 verifier: 12/12 PASS.
- P382 verifier: 11/11 PASS.
- P383 verifier: 11/11 PASS.
- P384 verifier: 10/10 PASS.
- P385 verifier: 10/10 PASS.
- P386 verifier: 8/8 PASS.
- P387 verifier: 8/8 PASS.
- P388 verifier: 8/8 PASS.
- P389 verifier: 15/15 PASS.
- Source syntax parser: 247 files scanned, 0 parse errors.

## Limitations and unresolved F03 work
This phase closes only the API prerequisite enforcement slice. The F03 feature is not closed. Invitation email delivery and deep-link UX, full cross-domain setup orchestration, multi-campus inheritance/override configuration, bulk configuration import with preview/validation/rollback, and live runtime acceptance remain open. Static source assertions are not runtime tests.
