# P395 — Robust onboarding assignment CSV parser

**Status:** Completed. F03 remains in progress; this phase did not start F04.

## Scope and implementation
- Replaced fragile `split(',')`/line splitting in onboarding task-assignment CSV preview with a quoted-field parser.
- Handles quoted commas, escaped double quotes, embedded newline characters in quoted fields, and CRLF line endings.
- Detects and rejects an unterminated quoted field with a user-readable error.
- Keeps UTF-8 BOM stripping, header normalization, duplicate-task checks, unknown-task checks, active-member email checks, blank-email unassignment, and apply gating.

## Validation
- P395 source assertions: 12/12 PASS.
- Runtime parser tests extracted from the actual source: 5/5 PASS (quoted comma, escaped quote, multiline field, CRLF, malformed quote rejection).
- P370–P395 verifier sweep: all PASS.
- Syntax scan: 247 TypeScript files, 0 parse errors.
- package.json parse: PASS.
- Cumulative archive baseline preservation: 100%; missing paths 0; duplicate entries 0; ZIP integrity PASS.

## Limitations
This phase does not implement bulk school configuration import, multi-campus inheritance, or transactional batch assignment API. Full app build, API runtime, DB migration and browser/mobile E2E were not run (workspace dependencies are absent).

## Deliverables
- `scripts/verify-p395-onboarding-assignment-csv-parser.mjs`
- `verify:p395` package script
- P395 status/delivery/test/ZIP verification reports
- Cumulative ZIP: `school-management-saas-P395-cumulative.zip`
