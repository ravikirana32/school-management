# P318 Delivery Report — Teacher Academic Assignment Usability (Cycle 1)

## Implemented
- Teacher assignment creation uses active staff catalogue entries.
- Grade selection uses the configured grade catalogue and clears dependent section/subject selections.
- Curriculum version selector loads subjects from the selected curriculum version.
- Subject dropdown is filtered to the selected grade; subject is optional because the API contract allows it.
- Section selector uses configured capacity/section records for the current academic year and selected grade; when no configured section exists, manual section entry remains available.
- Class-teacher designation and optional effective dates remain supported.
- Assignment payload includes `curriculumSubjectId` when selected, preserving compatibility with the API's optional subject field.
- Existing teacher assignment listing and staff management remain intact.

## Verification
- Source assertions: 9/9 PASS.
- ZIP integrity: PASS after packaging.
- Dependency-backed build/typecheck: NOT RUN (dependency availability not established).
- API runtime/browser/mobile validation: NOT RUN.

## Remaining gaps
- Validate API calls and saved assignments against a running authenticated school environment.
- Backend duplicate/conflict enforcement and advanced teacher workload validation remain open.
- Assignment edit/deactivate lifecycle and comprehensive tests remain backlog items.
