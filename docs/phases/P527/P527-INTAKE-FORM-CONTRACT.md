# P527 — Applicant Intake API & Forms

## Purpose
Provide a versioned, school-scoped public intake contract for applicant-facing enquiry and application forms, and expose the contract in the public portal so the applicant sees the required/optional field summary.

## Implementation
- Added `GET /api/v1/public/:organizationId/:schoolId/admissions/intake-form`.
- The endpoint checks the active school context before returning metadata; unknown/inactive school contexts return 404.
- Contract version `1.0` describes application and enquiry field names, labels, input types, requiredness, and applicable length constraints.
- Application metadata notes that draft creation precedes final submission; eligibility and required verified documents are still enforced by the existing submission workflow.
- Public portal fetches the contract on organization/school context changes and displays required and optional fields for both Enquiry and Application forms.
- Existing create application and draft correction routes/schemas remain unchanged.

## Scope limitation
This is a versioned schema-derived intake contract, not persisted school-customizable form builder configuration. Field rules are static in source and must remain aligned with Zod schemas. Runtime DB, tenant-negative, build/typecheck, browser/mobile and E2E acceptance remain pending.
