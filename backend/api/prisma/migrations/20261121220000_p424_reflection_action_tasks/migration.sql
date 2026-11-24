ALTER TABLE "CurriculumLessonPlanReflection" ADD CONSTRAINT "CurriculumLessonPlanReflection_id_org_school_key" UNIQUE ("id", "organizationId", "schoolId");
CREATE TABLE "CurriculumLessonReflectionTask" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "reflectionId" TEXT NOT NULL,
  "lessonPlanId" TEXT NOT NULL,
  "assignedToStaffMemberId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "title" VARCHAR(240) NOT NULL,
  "description" VARCHAR(3000),
  "priority" VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
  "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  "dueAt" TIMESTAMP(3),
  "completionNotes" VARCHAR(3000),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CurriculumLessonReflectionTask_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CurriculumLessonReflectionTask_priority_check" CHECK ("priority" IN ('LOW','MEDIUM','HIGH')),
  CONSTRAINT "CurriculumLessonReflectionTask_status_check" CHECK ("status" IN ('PENDING','IN_PROGRESS','COMPLETED')),
  CONSTRAINT "CurriculumLessonReflectionTask_reflection_scope_fkey" FOREIGN KEY ("reflectionId", "organizationId", "schoolId") REFERENCES "CurriculumLessonPlanReflection"("id", "organizationId", "schoolId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumLessonReflectionTask_plan_scope_fkey" FOREIGN KEY ("lessonPlanId", "organizationId", "schoolId") REFERENCES "CurriculumLessonPlan"("id", "organizationId", "schoolId") ON DELETE CASCADE,
  CONSTRAINT "CurriculumLessonReflectionTask_staff_scope_fkey" FOREIGN KEY ("assignedToStaffMemberId", "organizationId", "schoolId") REFERENCES "StaffMember"("id", "organizationId", "schoolId") ON DELETE RESTRICT
);
CREATE INDEX "CurriculumLessonReflectionTask_assignee_status_due_idx" ON "CurriculumLessonReflectionTask"("organizationId", "schoolId", "assignedToStaffMemberId", "status", "dueAt");
CREATE INDEX "CurriculumLessonReflectionTask_reflection_idx" ON "CurriculumLessonReflectionTask"("organizationId", "schoolId", "reflectionId");
CREATE INDEX "CurriculumLessonReflectionTask_plan_idx" ON "CurriculumLessonReflectionTask"("organizationId", "schoolId", "lessonPlanId");
ALTER TABLE "CurriculumLessonReflectionTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CurriculumLessonReflectionTask" FORCE ROW LEVEL SECURITY;
CREATE POLICY "CurriculumLessonReflectionTask_tenant_scope" ON "CurriculumLessonReflectionTask" USING ("organizationId" = current_setting('app.organization_id', true) AND "schoolId" = current_setting('app.school_id', true)) WITH CHECK ("organizationId" = current_setting('app.organization_id', true) AND "schoolId" = current_setting('app.school_id', true));
