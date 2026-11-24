# P07 — Board and Curriculum Configuration

## Scope delivered
- Board catalogue metadata for CBSE, CISCE ICSE, CISCE ISC, State Board, IB, IGCSE and custom curricula.
- School-specific board profile with jurisdiction, affiliation reference, category, effective dates and JSON configuration.
- School grade-level catalogue with stable code, sequence, stage, age range and active flag.
- Effective-dated curriculum versions linked optionally to a P06 academic year.
- Per-grade subject mappings with core/elective/language/vocational/co-curricular types, mandatory flag, language, weekly periods, marks and ordering.
- Tenant-scoped RLS and organization-school composite foreign keys.
- Curriculum entitlement flag in plan seeds and entitlement checks on board, grade and version mutations.
- School Admin local preview extended with board selection and grade-level editing.

## Important interpretation
The board catalogue is a configurable product taxonomy, not an official syllabus or legal determination. It does not claim that a school is affiliated or that a curriculum is approved. Official board requirements, syllabi and age/grade mappings must be verified against the relevant authority and maintained as versioned reference data.

## API
Base path `/api/v1/curriculum`:
- `GET /catalogue`
- `GET /:organizationId/:schoolId/board`
- `PUT /:organizationId/:schoolId/board`
- `GET /:organizationId/:schoolId/grades`
- `POST /:organizationId/:schoolId/grades`
- `GET /:organizationId/:schoolId/versions`
- `POST /:organizationId/:schoolId/versions`
- `POST /:organizationId/:schoolId/versions/:versionId/subjects`
- `GET /:organizationId/:schoolId/versions/:versionId/subjects`

All tenant endpoints require authentication and active school membership. Writes require SCHOOL_ADMIN.

## Boundaries
- Grade and subject data are school-configurable; no official grade/subject packs are seeded.
- Curriculum version activation/retirement workflow, bulk import/export, textbook/resource mapping and learning-outcome mapping are pending.
- Existing grade or curriculum records are not automatically rewritten when a board profile changes.
- The School Admin curriculum screen is a preview only and is not connected to API persistence.
