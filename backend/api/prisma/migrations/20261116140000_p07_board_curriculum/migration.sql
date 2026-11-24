CREATE TYPE "CurriculumVersionStatus" AS ENUM ('DRAFT','ACTIVE','RETIRED');
CREATE TYPE "CurriculumSubjectType" AS ENUM ('CORE','ELECTIVE','LANGUAGE','VOCATIONAL','CO_CURRICULAR');

CREATE TABLE "SchoolBoardProfile" (
 "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL UNIQUE,
 "boardKey" TEXT NOT NULL, "boardName" TEXT NOT NULL, "jurisdictionCountry" TEXT NOT NULL DEFAULT 'IN',
 "jurisdictionRegion" TEXT, "affiliationNumber" TEXT, "schoolCategory" TEXT,
 "effectiveFrom" DATE, "effectiveTo" DATE, "configuration" JSONB, "createdBy" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "SchoolBoardProfile_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
 CONSTRAINT "SchoolBoardProfile_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
 CONSTRAINT "SchoolBoardProfile_dates_check" CHECK ("effectiveTo" IS NULL OR "effectiveFrom" IS NULL OR "effectiveTo" >= "effectiveFrom")
);
CREATE INDEX "SchoolBoardProfile_org_board_idx" ON "SchoolBoardProfile"("organizationId","boardKey");

CREATE TABLE "GradeLevel" (
 "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "code" TEXT NOT NULL, "name" TEXT NOT NULL, "sequence" INTEGER NOT NULL,
 "stage" TEXT, "ageMin" INTEGER, "ageMax" INTEGER, "isActive" BOOLEAN NOT NULL DEFAULT true,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "GradeLevel_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
 CONSTRAINT "GradeLevel_age_check" CHECK (("ageMin" IS NULL OR "ageMin" >= 0) AND ("ageMax" IS NULL OR "ageMax" >= 0) AND ("ageMax" IS NULL OR "ageMin" IS NULL OR "ageMax" >= "ageMin")),
 CONSTRAINT "GradeLevel_school_code_key" UNIQUE ("schoolId","code"),
 CONSTRAINT "GradeLevel_school_sequence_key" UNIQUE ("schoolId","sequence")
);
ALTER TABLE "GradeLevel" ADD CONSTRAINT "GradeLevel_id_org_school_key" UNIQUE ("id","organizationId","schoolId");
CREATE INDEX "GradeLevel_org_school_active_idx" ON "GradeLevel"("organizationId","schoolId","isActive");

CREATE TABLE "CurriculumVersion" (
 "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "academicYearId" TEXT, "name" TEXT NOT NULL, "code" TEXT NOT NULL, "boardKey" TEXT NOT NULL,
 "versionLabel" TEXT, "status" "CurriculumVersionStatus" NOT NULL DEFAULT 'DRAFT',
 "effectiveFrom" DATE, "effectiveTo" DATE, "sourceReference" TEXT, "notes" TEXT,
 "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "CurriculumVersion_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
 CONSTRAINT "CurriculumVersion_year_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL,
 CONSTRAINT "CurriculumVersion_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
 CONSTRAINT "CurriculumVersion_dates_check" CHECK ("effectiveTo" IS NULL OR "effectiveFrom" IS NULL OR "effectiveTo" >= "effectiveFrom"),
 CONSTRAINT "CurriculumVersion_school_code_key" UNIQUE ("schoolId","code")
);
ALTER TABLE "CurriculumVersion" ADD CONSTRAINT "CurriculumVersion_id_org_school_key" UNIQUE ("id","organizationId","schoolId");
CREATE INDEX "CurriculumVersion_org_school_status_idx" ON "CurriculumVersion"("organizationId","schoolId","status");

CREATE TABLE "CurriculumSubject" (
 "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "curriculumVersionId" TEXT NOT NULL, "gradeLevelId" TEXT NOT NULL,
 "code" TEXT NOT NULL, "name" TEXT NOT NULL, "subjectType" "CurriculumSubjectType" NOT NULL DEFAULT 'CORE',
 "languageCode" TEXT, "isMandatory" BOOLEAN NOT NULL DEFAULT true, "weeklyPeriods" INTEGER,
 "maxMarks" DECIMAL(8,2), "passMarks" DECIMAL(8,2), "sequence" INTEGER NOT NULL DEFAULT 0,
 "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "CurriculumSubject_version_school_fkey" FOREIGN KEY ("curriculumVersionId","organizationId","schoolId") REFERENCES "CurriculumVersion"("id","organizationId","schoolId") ON DELETE CASCADE,
 CONSTRAINT "CurriculumSubject_grade_school_fkey" FOREIGN KEY ("gradeLevelId","organizationId","schoolId") REFERENCES "GradeLevel"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "CurriculumSubject_marks_check" CHECK (("maxMarks" IS NULL OR "maxMarks" >= 0) AND ("passMarks" IS NULL OR "passMarks" >= 0) AND ("maxMarks" IS NULL OR "passMarks" IS NULL OR "passMarks" <= "maxMarks")),
 CONSTRAINT "CurriculumSubject_periods_check" CHECK ("weeklyPeriods" IS NULL OR "weeklyPeriods" >= 0),
 CONSTRAINT "CurriculumSubject_version_grade_code_key" UNIQUE ("curriculumVersionId","gradeLevelId","code")
);
CREATE INDEX "CurriculumSubject_org_school_grade_idx" ON "CurriculumSubject"("organizationId","schoolId","gradeLevelId");

DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['SchoolBoardProfile','GradeLevel','CurriculumVersion','CurriculumSubject']
 LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format(
   'CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'',true) AND "schoolId" = current_setting(''app.current_school_id'',true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'',true) AND "schoolId" = current_setting(''app.current_school_id'',true))',
   lower(t || '_school_tenant_isolation'),t
  );
 END LOOP;
END $$;
