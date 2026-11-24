-- P418: school-owned lesson planning with curriculum outcome associations.
CREATE TABLE "CurriculumLessonPlan" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "curriculumVersionId" TEXT NOT NULL,
  "gradeLevelId" TEXT NOT NULL,
  "curriculumSubjectId" TEXT,
  "title" VARCHAR(180) NOT NULL,
  "objectives" VARCHAR(3000),
  "description" VARCHAR(5000),
  "plannedDate" DATE,
  "durationMinutes" INTEGER,
  "resources" VARCHAR(3000),
  "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CurriculumLessonPlan_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "CurriculumLessonPlan_school_scope_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumLessonPlan_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "CurriculumLessonPlan_version_fkey" FOREIGN KEY ("curriculumVersionId","organizationId","schoolId") REFERENCES "CurriculumVersion"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumLessonPlan_grade_fkey" FOREIGN KEY ("gradeLevelId","organizationId","schoolId") REFERENCES "GradeLevel"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "CurriculumLessonPlan_subject_fkey" FOREIGN KEY ("curriculumSubjectId","organizationId","schoolId") REFERENCES "CurriculumSubject"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "CurriculumLessonPlan_status_check" CHECK ("status" IN ('DRAFT','PLANNED','COMPLETED','ARCHIVED')),
  CONSTRAINT "CurriculumLessonPlan_duration_check" CHECK ("durationMinutes" IS NULL OR "durationMinutes" BETWEEN 1 AND 600)
);
CREATE INDEX "CurriculumLessonPlan_scope_version_grade_status_idx" ON "CurriculumLessonPlan"("organizationId","schoolId","curriculumVersionId","gradeLevelId","status");
ALTER TABLE "CurriculumLessonPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CurriculumLessonPlan" FORCE ROW LEVEL SECURITY;
CREATE POLICY "curriculumlessonplan_tenant_isolation" ON "CurriculumLessonPlan" USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));

CREATE TABLE "CurriculumLessonPlanOutcome" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "lessonPlanId" TEXT NOT NULL,
  "outcomeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CurriculumLessonPlanOutcome_school_scope_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumLessonPlanOutcome_plan_scope_fkey" FOREIGN KEY ("lessonPlanId","organizationId","schoolId") REFERENCES "CurriculumLessonPlan"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumLessonPlanOutcome_outcome_scope_fkey" FOREIGN KEY ("outcomeId","organizationId","schoolId") REFERENCES "CurriculumOutcome"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "CurriculumLessonPlanOutcome_school_plan_outcome_key" ON "CurriculumLessonPlanOutcome"("schoolId","lessonPlanId","outcomeId");
CREATE INDEX "CurriculumLessonPlanOutcome_scope_outcome_idx" ON "CurriculumLessonPlanOutcome"("organizationId","schoolId","outcomeId");
ALTER TABLE "CurriculumLessonPlanOutcome" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CurriculumLessonPlanOutcome" FORCE ROW LEVEL SECURITY;
CREATE POLICY "curriculumlessonplanoutcome_tenant_isolation" ON "CurriculumLessonPlanOutcome" USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));
