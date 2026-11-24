# P07 migration notes

Apply after P06. This migration assumes the P04 school composite key `School(id, organizationId)` and P06 `AcademicYear` table are present. All P07 tables are forced through RLS using transaction-local organization and school settings. Run migrations using the controlled deployment DB role and execute cross-tenant tests using the application's non-owner DB role.

A future hardening migration should add composite foreign keys from CurriculumSubject to GradeLevel and CurriculumVersion, including matching organizationId/schoolId columns, to supplement route-level checks.
