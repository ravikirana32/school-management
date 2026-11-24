# P317 Delivery Report — Subjects & Curriculum Usability

## Cycle 1 functionality implemented
- Subject mappings are fetched when a user selects a curriculum version, allowing version-specific list visibility.
- Subject catalogue table shows code, name, grade, type, mandatory flag, and weekly periods.
- Catalogue list filters by selected grade; clearing grade displays all mappings for the selected version.
- Duplicate creation is blocked at the UI submission stage for matching code or name in the same grade within the currently loaded selected-version catalogue; comparisons are case-insensitive.
- Existing API create payload fields are retained (grade, code, name, subject type, mandatory, weekly periods, sequence).

## Verification
- Static source assertions: 8/8 PASS.
- ZIP integrity: pending package validation (see final report).
- Dependency-backed build/typecheck: not run.
- Runtime API/database/browser/mobile validation: not run.

## Gaps
- P317-G001 runtime validation is READY_FOR_VERIFICATION.
- P317-G002 subject edit/delete lifecycle and advanced board-specific rules remain OPEN (Cycle 2).

This phase does not claim runtime acceptance or backend duplicate enforcement.
