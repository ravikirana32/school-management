# P412 Status — Curriculum Outcomes & Competency Mapping Foundation

**Status:** COMPLETE (source implementation slice)  
**Feature:** F04 Academics, boards, curriculum and progression

## Delivered
- Added school-owned `CurriculumOutcome` persistence model and PostgreSQL migration with tenant/school RLS.
- Outcome records are scoped to curriculum version and grade, optionally to a subject, and have unique codes within school/version/grade.
- Added title, description, competency domain, source reference, source edition, source URL and required provenance note fields.
- Added read endpoint for outcomes by curriculum version, with optional review-status filter.
- Added permission/entitlement-guarded create endpoint. It validates that version and active grade belong to the tenant/school and optional subject matches the same version and grade.
- Added review lifecycle endpoint with transitions DRAFT -> IN_REVIEW -> APPROVED; approved outcomes can be returned to review or archived. Archived outcomes can be restored to draft.
- Approval stamps reviewer and timestamp; SQL consistency check requires both for APPROVED.
- Added lifecycle helper and unit test source; added P412 focused verifier and package scripts.

## Limitations / not delivered
- Does not seed official board outcomes. Content remains school-authored/imported and provenance must be supplied.
- No outcome edit/delete endpoint or mapping UI in this phase.
- Prisma schema validation, migration application, build/typecheck, live API/DB/RLS, browser/mobile and E2E are not run because dependencies/runtime are unavailable.
- Reviewer deletion is restricted by migration FK to preserve approved review evidence.

## Validation
- P412 focused source verifier: 17/17 PASS.
- Unit test file authored (Vitest), but not executed; Vitest/dependencies unavailable in environment.
- Source syntax scan and Prisma validation are deferred; migration was reviewed statically only.
