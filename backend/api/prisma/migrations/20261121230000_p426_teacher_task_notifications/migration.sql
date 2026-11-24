ALTER TABLE "CurriculumLessonReflectionTask" ADD CONSTRAINT "CurriculumLessonReflectionTask_scope_unique" UNIQUE ("id", "organizationId", "schoolId");
-- P426 teacher follow-up task notifications
CREATE TABLE "CurriculumLessonReflectionTaskNotification" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "recipientStaffMemberId" TEXT NOT NULL, "taskId" TEXT, "notificationType" VARCHAR(24) NOT NULL,
  "title" VARCHAR(180) NOT NULL, "body" VARCHAR(500) NOT NULL, "dedupeKey" VARCHAR(240) NOT NULL,
  "readAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CurriculumLessonReflectionTaskNotification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CurriculumLessonReflectionTaskNotification_task_scope_fkey" FOREIGN KEY ("taskId", "organizationId", "schoolId") REFERENCES "CurriculumLessonReflectionTask"("id", "organizationId", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CurriculumLessonReflectionTaskNotification_staff_scope_fkey" FOREIGN KEY ("recipientStaffMemberId", "organizationId", "schoolId") REFERENCES "StaffMember"("id", "organizationId", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CurriculumLessonReflectionTaskNotification_dedupeKey_key" ON "CurriculumLessonReflectionTaskNotification"("dedupeKey");
CREATE INDEX "CurriculumLessonReflectionTaskNotification_recipient_idx" ON "CurriculumLessonReflectionTaskNotification"("organizationId", "schoolId", "recipientStaffMemberId", "readAt", "createdAt");
CREATE INDEX "CurriculumLessonReflectionTaskNotification_task_type_idx" ON "CurriculumLessonReflectionTaskNotification"("organizationId", "schoolId", "taskId", "notificationType");
ALTER TABLE "CurriculumLessonReflectionTaskNotification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CurriculumLessonReflectionTaskNotification" FORCE ROW LEVEL SECURITY;
CREATE POLICY "CurriculumLessonReflectionTaskNotification_tenant_policy" ON "CurriculumLessonReflectionTaskNotification" USING ("organizationId" = current_setting('app.organization_id', true) AND "schoolId" = current_setting('app.school_id', true)) WITH CHECK ("organizationId" = current_setting('app.organization_id', true) AND "schoolId" = current_setting('app.school_id', true));
