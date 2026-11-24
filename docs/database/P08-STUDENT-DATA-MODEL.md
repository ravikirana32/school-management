# P08 Student Data Model

- `Student`: core student identity and admission record; unique admission number per school.
- `Guardian`: contact record scoped to the school.
- `StudentGuardian`: many-to-many student/guardian link with relationship and authorization flags.
- `StudentEnrollment`: academic-year and grade placement, with composite FKs to student, academic year and grade.
- `StudentPickupContact`: explicitly authorized pickup contact and validity window.
- `StudentDocument`: private object metadata and document classification.

P08 does not make Guardian a User or create a Parent membership. Verified parent portal linking will be a separate security workflow. All P08 tables are protected by RLS policies requiring current organization and school settings.
