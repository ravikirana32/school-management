CREATE TABLE "SchoolAssessmentExam" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL,
  "gradeLevelId" TEXT NOT NULL,
  "sectionName" VARCHAR(40),
  "subjectName" VARCHAR(120) NOT NULL,
  "examName" VARCHAR(160) NOT NULL,
  "examDate" DATE NOT NULL,
  "maxMarks" DECIMAL(7,2) NOT NULL,
  "passMarks" DECIMAL(7,2),
  "marks" JSONB NOT NULL DEFAULT '[]',
  "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolAssessmentExam_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SchoolAssessmentExam_id_organizationId_schoolId_key" UNIQUE ("id", "organizationId", "schoolId")
);
CREATE INDEX "SchoolAssessmentExam_org_school_year_grade_date_idx" ON "SchoolAssessmentExam"("organizationId", "schoolId", "academicYearId", "gradeLevelId", "examDate");
CREATE INDEX "SchoolAssessmentExam_org_school_status_created_idx" ON "SchoolAssessmentExam"("organizationId", "schoolId", "status", "createdAt");
