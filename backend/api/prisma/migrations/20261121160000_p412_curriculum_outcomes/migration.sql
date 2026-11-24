-- P412: School-owned curriculum outcomes with source provenance and review lifecycle.
ALTER TABLE "CurriculumSubject" ADD CONSTRAINT "CurriculumSubject_id_org_school_key" UNIQUE ("id","organizationId","schoolId");
CREATE TYPE "CurriculumOutcomeReviewStatus" AS ENUM ('DRAFT','IN_REVIEW','APPROVED','ARCHIVED');
CREATE TABLE "CurriculumOutcome" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "curriculumVersionId" TEXT NOT NULL,
  "curriculumSubjectId" TEXT,
  "gradeLevelId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "competencyDomain" TEXT,
  "sourceReference" TEXT,
  "sourceEdition" TEXT,
  "sourceUrl" TEXT,
  "provenanceNote" TEXT NOT NULL,
  "reviewStatus" "CurriculumOutcomeReviewStatus" NOT NULL DEFAULT 'DRAFT',
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CurriculumOutcome_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumOutcome_version_school_fkey" FOREIGN KEY ("curriculumVersionId","organizationId","schoolId") REFERENCES "CurriculumVersion"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumOutcome_grade_school_fkey" FOREIGN KEY ("gradeLevelId","organizationId","schoolId") REFERENCES "GradeLevel"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "CurriculumOutcome_subject_school_fkey" FOREIGN KEY ("curriculumSubjectId","organizationId","schoolId") REFERENCES "CurriculumSubject"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "CurriculumOutcome_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "CurriculumOutcome_reviewer_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "CurriculumOutcome_code_nonempty_check" CHECK (length(trim("code")) > 0),
  CONSTRAINT "CurriculumOutcome_title_nonempty_check" CHECK (length(trim("title")) > 0),
  CONSTRAINT "CurriculumOutcome_provenance_nonempty_check" CHECK (length(trim("provenanceNote")) > 0),
  CONSTRAINT "CurriculumOutcome_review_consistency_check" CHECK (("reviewStatus" = 'APPROVED' AND "reviewedAt" IS NOT NULL AND "reviewedBy" IS NOT NULL) OR "reviewStatus" <> 'APPROVED')
);
CREATE UNIQUE INDEX "CurriculumOutcome_school_version_grade_code_key" ON "CurriculumOutcome"("schoolId","curriculumVersionId","gradeLevelId","code");
CREATE INDEX "CurriculumOutcome_org_school_version_status_idx" ON "CurriculumOutcome"("organizationId","schoolId","curriculumVersionId","reviewStatus");
ALTER TABLE "CurriculumOutcome" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CurriculumOutcome" FORCE ROW LEVEL SECURITY;
CREATE POLICY "curriculumoutcome_school_tenant_isolation" ON "CurriculumOutcome" USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));
