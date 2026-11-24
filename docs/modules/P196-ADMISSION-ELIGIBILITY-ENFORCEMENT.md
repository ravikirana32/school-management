# P196 — Eligibility and Document Checklist Enforcement Completion

## Source changes
- Admission submission now fails closed when no enabled eligibility rule can be resolved for the application school, academic year, grade, and board.
- Resolution retains board-specific first, then `ANY` fallback behavior.
- Staff transition submission returns HTTP 409 with `ADMISSION_RULES_NOT_CONFIGURED` when the rule is missing.
- Public submission returns HTTP 409 with the same code and an explanatory message when the rule is missing.
- Existing age validation and clean/verified document checks continue to run when a rule is present.

## Operational note
Schools must configure an enabled rule for each grade/academic year/board (or `ANY`) before applicants can submit. This is a deliberate fail-closed policy to prevent unrestricted submissions when eligibility configuration is absent.

## Deferred validation
Build/typecheck, migration execution, API integration tests, web/mobile tests, and runtime acceptance are deferred to the dedicated validation phases.
