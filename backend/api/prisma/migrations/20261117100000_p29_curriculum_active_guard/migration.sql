-- P29: enforce one active curriculum version per school and academic year.
-- Preflight deliberately aborts rather than silently retiring production data.
DO $$
DECLARE duplicate_group RECORD;
BEGIN
  SELECT "schoolId", "academicYearId", COUNT(*) AS active_count
    INTO duplicate_group
    FROM "CurriculumVersion"
   WHERE "status" = 'ACTIVE' AND "academicYearId" IS NOT NULL
   GROUP BY "schoolId", "academicYearId"
  HAVING COUNT(*) > 1
   LIMIT 1;
  IF FOUND THEN
    RAISE EXCEPTION 'P29 migration blocked: multiple active curriculum versions for school %, academic year %. Review and retire duplicates before retrying.', duplicate_group."schoolId", duplicate_group."academicYearId";
  END IF;

  SELECT "schoolId", NULL::text AS "academicYearId", COUNT(*) AS active_count
    INTO duplicate_group
    FROM "CurriculumVersion"
   WHERE "status" = 'ACTIVE' AND "academicYearId" IS NULL
   GROUP BY "schoolId"
  HAVING COUNT(*) > 1
   LIMIT 1;
  IF FOUND THEN
    RAISE EXCEPTION 'P29 migration blocked: multiple active curriculum versions without an academic year for school %. Review and retire duplicates before retrying.', duplicate_group."schoolId";
  END IF;
END $$;

CREATE UNIQUE INDEX "CurriculumVersion_one_active_per_school_year"
  ON "CurriculumVersion" ("schoolId", "academicYearId")
  WHERE "status" = 'ACTIVE' AND "academicYearId" IS NOT NULL;

CREATE UNIQUE INDEX "CurriculumVersion_one_active_without_year_per_school"
  ON "CurriculumVersion" ("schoolId")
  WHERE "status" = 'ACTIVE' AND "academicYearId" IS NULL;

-- At most one primary guardian link per student.
DO $$
DECLARE duplicate_group RECORD;
BEGIN
  SELECT "studentId", COUNT(*) AS link_count
    INTO duplicate_group
    FROM "StudentGuardian"
   WHERE "isPrimary" = TRUE
   GROUP BY "studentId"
  HAVING COUNT(*) > 1
   LIMIT 1;
  IF FOUND THEN
    RAISE EXCEPTION 'P29 migration blocked: student % has multiple primary guardian links. Review the guardian records before retrying.', duplicate_group."studentId";
  END IF;

  SELECT "staffMemberId", COUNT(*) AS open_period_count
    INTO duplicate_group
    FROM "StaffEmploymentHistory"
   WHERE "endsOn" IS NULL
   GROUP BY "staffMemberId"
  HAVING COUNT(*) > 1
   LIMIT 1;
  IF FOUND THEN
    RAISE EXCEPTION 'P29 migration blocked: staff member % has multiple open employment periods. Review the employment history before retrying.', duplicate_group."staffMemberId";
  END IF;
END $$;

CREATE UNIQUE INDEX "StudentGuardian_one_primary_per_student"
  ON "StudentGuardian" ("studentId")
  WHERE "isPrimary" = TRUE;

CREATE UNIQUE INDEX "StaffEmploymentHistory_one_open_period_per_staff"
  ON "StaffEmploymentHistory" ("staffMemberId")
  WHERE "endsOn" IS NULL;
