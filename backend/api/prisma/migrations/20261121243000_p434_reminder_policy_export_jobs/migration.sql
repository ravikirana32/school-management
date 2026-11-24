CREATE TABLE "TeacherTaskReminderPolicyExportJob" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "requestedByUserId" TEXT NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'QUEUED',
  "filters" JSONB NOT NULL,
  "csvContent" TEXT,
  "rowCount" INTEGER,
  "errorCode" VARCHAR(64),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "TeacherTaskReminderPolicyExportJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TeacherTaskReminderPolicyExportJob_school_scope_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeacherTaskReminderPolicyExportJob_status_check" CHECK ("status" IN ('QUEUED','PROCESSING','COMPLETED','FAILED','EXPIRED'))
);
CREATE INDEX "TeacherTaskReminderPolicyExportJob_org_school_user_created_idx" ON "TeacherTaskReminderPolicyExportJob"("organizationId", "schoolId", "requestedByUserId", "createdAt");
CREATE INDEX "TeacherTaskReminderPolicyExportJob_status_created_idx" ON "TeacherTaskReminderPolicyExportJob"("status", "createdAt");
CREATE INDEX "TeacherTaskReminderPolicyExportJob_expires_idx" ON "TeacherTaskReminderPolicyExportJob"("expiresAt");
ALTER TABLE "TeacherTaskReminderPolicyExportJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherTaskReminderPolicyExportJob" FORCE ROW LEVEL SECURITY;
CREATE POLICY "TeacherTaskReminderPolicyExportJob_tenant_policy" ON "TeacherTaskReminderPolicyExportJob" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
