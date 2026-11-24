# P417 Delivery Report — Curriculum Outcome Coverage Dashboard

P417 adds an outcomes-to-assessment coverage dashboard to F04 Curriculum administration.

## API
`GET /api/v1/curriculum/:organizationId/:schoolId/versions/:versionId/outcome-assessment-coverage`

Optional query filters:
- `gradeLevelId`
- `curriculumSubjectId`
- `reviewStatus` (DRAFT, IN_REVIEW, APPROVED, ARCHIVED)

The endpoint verifies active school membership/read permission, checks that the curriculum version belongs to the requesting organization and school, and returns only tenant/school-scoped outcomes, mapping records, exams, curriculum subjects, and grade labels. Exam results are limited to grades represented in the filtered outcomes and to the curriculum version's academic year when that year is configured.

## Dashboard data
- Overall mapped/unmapped coverage, mapping count, exams mapped, and multiple mapping count.
- Grade-wise totals, mapped/unmapped, mapped exam count and coverage percentage.
- Subject-wise totals and coverage for subject-scoped outcomes.
- Exam-wise mapped vs eligible outcomes and percentage, including matching exams with no mappings.
- Unmapped outcome action list.
- Multi-mapped outcome list with mapping count.

Coverage percentage is based on unique outcomes mapped at least once; mapping count remains separately reported to preserve multiple alignments.

## School Admin
The dashboard is integrated into the existing Curriculum Outcomes workspace. It uses the selected curriculum version and the workspace grade/review filters, provides an additional subject filter, and displays KPI cards and tables. Subject selection resets when the version/grade/review filter changes.

## Verification
- P417 verifier: 24/24 source assertions PASS.
- Helper smoke tests: 7/7 PASS.
- P411, P412, P413, P414, P415, and P416 regressions PASS.
- TS/TSX parser scan: 262 files, 0 diagnostics.
- Runtime/build/DB/browser/mobile/E2E validations are deferred and not claimed.
