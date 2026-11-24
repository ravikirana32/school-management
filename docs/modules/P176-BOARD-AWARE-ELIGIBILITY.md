# P176 — Board-aware Admissions Eligibility

## Implemented (source)
- Added optional `boardCode` to AdmissionApplication records.
- Added migration for existing databases.
- Application creation accepts boardCode through the API; enquiry conversion also carries it.
- School Admin and Staff Mobile application creation include board-code input.
- Submission-time rule resolution checks the applicant board's configured rule first, then falls back to `ANY`.
- Age and required-document checks from P175 now apply to the selected board rule or fallback rule.

## Remaining limitations
- No board reference catalog or standardized board-code validation; field is free text and must match rule configuration.
- Existing applications without boardCode use `ANY`.
- Checklist remains configured as rule JSON; no automatic application checklist generation or Parent/Public checklist UI yet.
- Build/test/runtime and migration apply remain deferred.

## Verification
- Source inspection confirms schema, route, migration, and both UI surfaces updated.
- No executable tests run.
