# P08 migration notes

Apply after P07. Adds the AcademicYear composite unique key required by tenant-safe enrollment FKs. The P08 tables are all forced through RLS and use school/org composite FKs. Guardian records are school-scoped; StudentGuardian has a composite FK to both student and guardian within the same organization/school. Apply using the migration role and verify access using a non-owner runtime role.
