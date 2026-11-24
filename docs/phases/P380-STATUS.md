# P380 Status — Board affiliation and grade setup onboarding (C2-04/F03)

## Implemented
- Expanded server readiness from seven to nine configuration checks.
- Added school board affiliation readiness using tenant-scoped `SchoolBoardProfile` query.
- Added active grade-level readiness using tenant-scoped `GradeLevel` query.
- Added actionable remediation guidance for board and grade setup.
- Added guided wizard entries for board affiliation and grade levels, linked to existing Board & curriculum workspace.
- Added prerequisite ordering: board profile requires school identity; grade levels require board profile; grading policy now requires profile, active year and grade levels.
- Expanded persisted wizard step-key allowlist and task-assignment allowlist to include the new checks; existing saved step keys remain valid.
- Updated P372/P374/P378 contract verifiers for the expanded checklist.

## Verification
- P380 verifier: 13/13 PASS.
- Updated P372 verifier: 16/16 PASS.
- Updated P374 verifier: 16/16 PASS.
- Updated P378 verifier: 20/20 PASS.
- Source syntax, package audit, domain tests and P370–P379 regression checks: see P380 test report.
- Prisma CLI, DB migration, typecheck/build/runtime and E2E remain unverified.
