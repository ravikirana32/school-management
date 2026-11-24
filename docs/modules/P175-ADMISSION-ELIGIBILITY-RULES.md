# P175 — Admission Eligibility & Document Checklist Rules

## Delivered (source implementation)
- Added school-scoped `AdmissionEligibilityRule` records by academic year, grade/level and board code.
- Configurable minimum/maximum age in months and cutoff date (no universal age policy hard-coded).
- Configurable required document checklist (code + display label).
- Added tenant/permission-protected GET and PUT APIs: `/eligibility-rules`.
- School Admin UI includes rule editor and list for the selected academic year/grade.
- Application submission transition (`SUBMITTED`) enforces the enabled `ANY` rule: missing DOB when age is constrained, minimum/maximum age, and required docs must be verified and scanner-clean.
- Migration added for rule storage.

## API payload example
```json
{
  "academicYearId": "<academic-year-id>",
  "gradeLevelId": "<grade-id>",
  "boardCode": "ANY",
  "minAgeMonths": 60,
  "maxAgeMonths": 84,
  "ageCutoffDate": "2027-06-01",
  "requiredDocuments": [{"code":"BIRTH_CERT","label":"Birth certificate"}],
  "enabled": true
}
```

## Limitations / remaining gaps
- Board-specific rules are stored/configurable but application records do not yet carry board selection; submission enforcement currently resolves `ANY` rules only.
- Required document `code` values must match `AdmissionApplicationDocument.documentType`; no checklist auto-provisioning into each application yet.
- Staff Mobile checklist display/compliance UI is not yet integrated.
- Parent/public self-service remains open.
- No build, migration apply, API test, UI test, mobile test or runtime validation run (deferred by user instruction).

## Source verification
- Inspected and edited schema, migration, admissions API route and School Admin Admissions workspace.
- Source-only; no executable acceptance claims.
