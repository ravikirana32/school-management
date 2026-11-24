-- P416: persist school-owned curriculum outcome to assessment exam alignment.
ALTER TABLE "CurriculumOutcome" ADD CONSTRAINT "CurriculumOutcome_id_org_school_key" UNIQUE ("id","organizationId","schoolId");
CREATE TABLE "CurriculumOutcomeAssessmentMapping" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "outcomeId" TEXT NOT NULL,
  "examId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CurriculumOutcomeAssessmentMapping_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumOutcomeAssessmentMapping_outcome_scope_fkey" FOREIGN KEY ("outcomeId","organizationId","schoolId") REFERENCES "CurriculumOutcome"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumOutcomeAssessmentMapping_exam_scope_fkey" FOREIGN KEY ("examId","organizationId","schoolId") REFERENCES "SchoolAssessmentExam"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumOutcomeAssessmentMapping_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "CurriculumOutcomeAssessmentMapping_school_outcome_exam_key" ON "CurriculumOutcomeAssessmentMapping"("schoolId","outcomeId","examId");
CREATE INDEX "CurriculumOutcomeAssessmentMapping_org_school_outcome_idx" ON "CurriculumOutcomeAssessmentMapping"("organizationId","schoolId","outcomeId");
CREATE INDEX "CurriculumOutcomeAssessmentMapping_org_school_exam_idx" ON "CurriculumOutcomeAssessmentMapping"("organizationId","schoolId","examId");
ALTER TABLE "CurriculumOutcomeAssessmentMapping" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CurriculumOutcomeAssessmentMapping" FORCE ROW LEVEL SECURITY;
CREATE POLICY "curriculumoutcomeassessmentmapping_tenant_isolation" ON "CurriculumOutcomeAssessmentMapping" USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));
