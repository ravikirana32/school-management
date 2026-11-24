# P274 Delivery Report — Results & Grades

## Baseline and preservation
- Started from the supplied, checksum-verified P273 cumulative archive.
- Preserved existing exam creation, marks save, publish, assessment routes, report-card governance and the full prior cumulative tree.

## Implemented
- Added exam roster API using active school enrollments scoped by academic year, grade and optional section.
- Roster access is tenant/school scoped; active staff users are additionally constrained to currently active teacher assignments for the matching exam scope.
- Replaced the marks JSON-only experience with roster-driven, row-based marks entry. Existing saved marks are loaded into the roster inputs; the API remains the source of validation.
- Marks-save now merges the submitted roster subset with existing marks so assignment-scoped teacher entry does not erase marks for students outside that teacher's roster.
- Added calculated results endpoint with student details, score, max marks, percentage, basic letter grade, pass/fail, and class summary (pass percentage, average percentage, total score and maximum possible score).
- Added basic grade bands: A+ >=90, A >=80, B >=70, C >=60, D >=50, E >=40, F <40. These are a generic starter scheme, not board-approved grading policy.
- Added unit tests for grade boundaries, aggregate calculations and invalid values.
- Added P274 static verifier.

## P273 gap updates
- P273-G001 roster-based marks entry is implemented at source level; runtime verification remains deferred (READY_FOR_VERIFICATION).
- P273-G002 basic per-exam result calculation and class summary now exist. Persistent report-card aggregation and board-specific grading remain OPEN.
- P273-G003 build/typecheck, migration/client generation, API/browser/mobile/E2E validation remains OPEN and deferred.

## Remaining P274 gaps
- P274-G001 — Configure board/school grade bands, grade-point systems and pass policy instead of generic hard-coded bands — OPEN.
- P274-G002 — Aggregate published exam results across terms/subjects into existing report-card resultSummary and governance flow — OPEN.
- P274-G003 — Add subject-wise/term-wise result aggregation, rank/position policy and configurable handling of absent/exempt students — OPEN.
- P274-G004 — Runtime/build/typecheck/API/browser/mobile/E2E validation remains deferred.

## Verification
- Source static verification script added; results recorded in P274 archive verification.
- Dependency-backed Vitest/typecheck/build/runtime validation not executed because node_modules is absent from the supplied archive/workspace.
- Do not interpret P274 as runtime-validated or production-ready.
- Gaps closed: 0 (source implementation is complete for the phase's basic scope, but gaps remain open or ready for verification).
