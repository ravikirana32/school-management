# P381 Status — Room and fee onboarding readiness (C2-04/F03)

## Implemented
- Expanded onboarding readiness to eleven setup checks.
- Added tenant-scoped active-room query and readiness requiring at least one active room/resource.
- Added tenant-scoped published fee-structure query and readiness requiring a published school-wide or active-year fee structure.
- Added actionable remediation for rooms and fee configuration.
- Added guided tasks routed to existing Timetable/Rooms and Fees workspaces.
- Added prerequisites: rooms require school profile and grade levels; fee structures require academic year and grade levels.
- Expanded saved wizard and task assignment allowlists to include room and fee tasks.

## Verification
- P381 verifier: 12/12 PASS.
- Updated P372 dependency verifier: 18/18 PASS.
- Updated P374 readiness verifier: 16/16 PASS.
- Updated P378 assignment verifier: 20/20 PASS.
- P379 schema dedup verifier: 6/6 PASS; P380 board/grade verifier: 13/13 PASS.
- P370–P377 regressions, syntax, package audit, domain invariants: PASS.
- Prisma CLI validation, DB migration, API typecheck/build/runtime and browser/E2E: not run.
