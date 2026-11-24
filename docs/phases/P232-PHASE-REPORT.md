# P232 — Student Profile Remediation Workflow

## Implemented
- Added tenant/school-scoped PATCH student profile endpoint.
- Requires `students.update` and PII permission gate; updates are restricted to the addressed student in the current tenant.
- Uses a partial strict schema; excludes guardian relationships and admission number from profile edits. Validates date of birth and enum/field constraints. Empty updates are rejected.
- Audits successful changes and records changed field names only.
- Added School Admin correction form for date of birth, gender, student email/phone, address line 1, city, state, postal code, nationality and primary language.
- On save, UI refreshes profile completeness summary so missing fields can be re-evaluated.
- Updated root/docs master checklist.

## Source assertions
- PATCH route, permission checks, partial validation, non-empty payload guard, tenant-scoped lookup/update and audit record present.
- Admin UI submits profile fields and refreshes completeness report.
- No build/typecheck, DB/runtime, formal tests, mobile builds or E2E executed, per direction.

## Open gaps
- The correction form currently provides only selected basic profile fields; add remaining profile fields as prioritized.
- Blank values are treated as omitted (cannot clear fields from this form yet).
- Guardian and document remediation remain separate workflows.
- Final runtime, permission and validation checks deferred.
