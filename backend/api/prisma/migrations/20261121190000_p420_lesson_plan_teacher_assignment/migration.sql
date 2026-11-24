CREATE TABLE "CurriculumLessonPlanTeacherAssignment" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "lessonPlanId" TEXT NOT NULL,
  "staffMemberId" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "assignedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CurriculumLessonPlanTeacherAssignment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CurriculumLessonPlanTeacherAssignment_plan_fk" FOREIGN KEY ("lessonPlanId", "organizationId", "schoolId") REFERENCES "CurriculumLessonPlan"("id", "organizationId", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CurriculumLessonPlanTeacherAssignment_staff_fk" FOREIGN KEY ("staffMemberId", "organizationId", "schoolId") REFERENCES "StaffMember"("id", "organizationId", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CurriculumLessonPlanTeacherAssignment_school_plan_staff_key" ON "CurriculumLessonPlanTeacherAssignment"("schoolId", "lessonPlanId", "staffMemberId");
CREATE INDEX "CurriculumLessonPlanTeacherAssignment_org_school_staff_idx" ON "CurriculumLessonPlanTeacherAssignment"("organizationId", "schoolId", "staffMemberId");
CREATE INDEX "CurriculumLessonPlanTeacherAssignment_org_school_plan_primary_idx" ON "CurriculumLessonPlanTeacherAssignment"("organizationId", "schoolId", "lessonPlanId", "isPrimary");
ALTER TABLE "CurriculumLessonPlanTeacherAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CurriculumLessonPlanTeacherAssignment" FORCE ROW LEVEL SECURITY;
CREATE POLICY "CurriculumLessonPlanTeacherAssignment_tenant_policy" ON "CurriculumLessonPlanTeacherAssignment" USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));
