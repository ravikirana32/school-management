# P412 Delivery Report — Curriculum Outcomes & Competency Mapping

P412 adds a persisted school-owned curriculum outcome layer on top of P411 board starter metadata and existing curriculum versions/subjects/grades.

### Outcome record
- Version, grade, and optional subject scope
- Code, title, description, competency domain
- Source reference, edition, URL, required provenance note
- Draft/in-review/approved/archived review state
- Reviewer identity and review timestamp when approved

### API
- `GET /api/v1/curriculum/:organizationId/:schoolId/versions/:versionId/outcomes` (read permission; optional reviewStatus filter)
- `POST /api/v1/curriculum/:organizationId/:schoolId/versions/:versionId/outcomes` (academics.manage and curriculum entitlement)
- `PATCH /api/v1/curriculum/:organizationId/:schoolId/outcomes/:outcomeId/review` (academics.manage)

### Data integrity/security
- Unique outcome code per school/curriculum-version/grade.
- Composite foreign keys ensure version, grade, and optional subject are tenant/school aligned; subject must match version and grade in API validation.
- Tenant/school RLS enabled and forced.
- Approval requires reviewer and timestamp; reviewer delete restricted.
- Transition rules reject direct DRAFT -> APPROVED.

### Verification
- P412 focused verifier: 17/17 PASS.
- Unit test source created but not executed due to unavailable dependencies.
- No runtime/API/DB/browser/mobile/E2E tests claimed.
