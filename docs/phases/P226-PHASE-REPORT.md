# P226 — Admissions Document Replacement Lineage

## Implemented
- Added optional `replacesDocumentId` metadata to admission application documents, with an index scoped by organization, school, and application.
- Public applicant and School Admin upload APIs accept replacement references and validate that the referenced document is rejected, belongs to the same application/school/organization, and has the same document type.
- Applicant portal and School Admin upload forms can select a rejected document to replace.
- Replacement documents are stored as new document records; previous rejected records are preserved, so version lineage is retained.
- New replacement uploads continue through the existing private upload, quarantine, scanning, and review workflow.

## Source-level verification
- Confirmed replacement metadata in Prisma schema and migration.
- Confirmed validation in both upload APIs.
- Confirmed both portal/admin forms pass the selected replacement ID.
- Confirmed public document listing exposes replacement lineage.
- ZIP integrity checked after archive creation.

## Not run (deferred per project instruction)
Builds, typechecks, migration execution, runtime, API/integration tests, mobile builds, E2E, security and deployment validation.
