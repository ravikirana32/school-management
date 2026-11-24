# P313 Status — Fee Assignment Catalog Selectors

**Phase:** P313 Cycle 1
**Status:** Source implementation complete; runtime acceptance pending

## Delivered
- Academic year assignment target is selected from the authenticated school session's academic-year catalogue.
- Grade target is selected from the school curriculum grades API.
- Configured sections are loaded from the school's admission capacity catalogue and filtered by selected academic year and grade.
- Changing year or grade clears selected section and invalidates the assignment preview.
- Existing preview and confirm assignment API flow remains unchanged; assigned charges are still draft charges.
- Help copy reflects the existing preview/assignment functionality accurately.

## Verification
- Static source assertions: 8/8 PASS.
- ZIP integrity: PASS.
- Dependency-backed build/typecheck and API/browser/mobile runtime: NOT RUN.

## Open gaps
- P313-G001: runtime acceptance pending.
- P313-G002: only capacity-configured sections appear; blank section means all sections.
- P313-G003: Cycle 2 optional component choices, overrides, discounts/installments, structure version/clone governance.
