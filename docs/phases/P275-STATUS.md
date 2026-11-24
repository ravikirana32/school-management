# P275 Status — Fees & Fee Structure

Implemented source coverage:
- New school-scoped reusable FeeStructure model with component JSON, currency, effective dates, status and audit identity fields.
- Migration creates the table, school-scoped unique code and tenant/status index.
- API: list, create draft, edit draft-only, publish and archive fee structures.
- Validation for required component names, positive amounts, supported billing frequency, currency and date ordering.
- School Admin UI: create structure, add/remove components, total preview, list, publish and archive.
- Tenant isolation enforced with PostgreSQL RLS for FeeStructure.
- Corrected a literal escaped newline in the existing school-admin import block so the entrypoint remains syntactically valid.
- P275 UI embedded in existing Finance workspace; existing accounting/fees workflows retained.
- Source-level static assertions.


Deferred validation and next-phase implications:
- Prisma generate/typecheck/build/runtime/database migration/API/browser/mobile/E2E validation not run because dependencies are not installed in this extracted environment.
- Academic-year and grade-level picker integration remains follow-up; IDs are accepted by API but UI inputs are not yet linked to school catalogs.
- Fee structure assignment to students/classes is P276.
- Published structures are currently immutable only through the draft edit endpoint; versioning/clone workflow is a future gap.
- Existing manual student fee charge APIs remain unchanged and are not automatically converted from fee structures.

Baseline: P274 cumulative archive.
