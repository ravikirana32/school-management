# P07 Board and Curriculum Data Model

- `SchoolBoardProfile`: one selected board/jurisdiction profile per school; effective dates and affiliation reference.
- `GradeLevel`: ordered, school-owned grade catalogue; unique code and sequence per school.
- `CurriculumVersion`: versioned curriculum definition optionally linked to a P06 academic year.
- `CurriculumSubject`: subject mapping from a curriculum version to a grade; includes type, language, mandatory flag, period and marks metadata.

Every table includes `organizationId` and `schoolId`, is protected by forced PostgreSQL RLS requiring both tenant settings, and uses a composite foreign key to `School(id, organizationId)`. CurriculumSubject uses composite foreign keys to both CurriculumVersion and GradeLevel, including organizationId and schoolId, so the database independently prevents cross-school mappings.
