# P407 Status — Campus Registry Foundation

**Status:** COMPLETE (source implementation slice)  
**F03:** IN_PROGRESS  
**F04:** BLOCKED until F03 is completed.

## Delivered
- Tenant/school scoped `SchoolCampus` registry table with migration and forced RLS.
- List, create, update and soft-archive campus API endpoints guarded by active membership and `school.settings.manage`.
- Validated campus code/name/description/status fields; case-insensitive campus code uniqueness; database constraints.
- Active main-campus uniqueness constraint and transactionally clears prior main-campus selection when creating/updating a new main campus.
- Audit events for create, update, archive.
- Campus inheritance save now requires active registered campus and any parent campus to be active/registered.
- Effective inheritance/config endpoints reject unknown/inactive registry campuses.

## API
- `GET /:organizationId/:schoolId/campus-registry`
- `POST /:organizationId/:schoolId/campus-registry`
- `PUT /:organizationId/:schoolId/campus-registry/:campusId`
- `DELETE /:organizationId/:schoolId/campus-registry/:campusId` (soft archive)

## Validation
- P407 source verifier: 20/20 PASS.
- P400–P407 focused verifier sweep: PASS (individual counts in test report).
- TypeScript syntax scan: 250 files, 0 parse errors.
- Runtime/database integration, migration application, build/typecheck, browser/mobile and E2E remain unrun.
