CREATE TABLE "CurriculumLessonPlanReflection" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "lessonPlanId" TEXT NOT NULL,
  "staffMemberId" TEXT NOT NULL,
  "teachingNotes" VARCHAR(5000),
  "challenges" VARCHAR(3000),
  "followUpActions" VARCHAR(3000),
  "actualDurationMinutes" INTEGER,
  "reflectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CurriculumLessonPlanReflection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CurriculumLessonPlanReflection_plan_fk" FOREIGN KEY ("lessonPlanId", "organizationId", "schoolId") REFERENCES "CurriculumLessonPlan"("id", "organizationId", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CurriculumLessonPlanReflection_staff_fk" FOREIGN KEY ("staffMemberId", "organizationId", "schoolId") REFERENCES "StaffMember"("id", "organizationId", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CurriculumLessonPlanReflection_duration_check" CHECK ("actualDurationMinutes" IS NULL OR ("actualDurationMinutes" BETWEEN 1 AND 600))
);
CREATE INDEX "CurriculumLessonPlanReflection_org_school_staff_date_idx" ON "CurriculumLessonPlanReflection"("organizationId", "schoolId", "staffMemberId", "reflectedAt");
ALTER TABLE "CurriculumLessonPlanReflection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CurriculumLessonPlanReflection" FORCE ROW LEVEL SECURITY;
CREATE POLICY "CurriculumLessonPlanReflection_tenant_policy" ON "CurriculumLessonPlanReflection" USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));
