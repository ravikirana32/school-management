-- P428 school-level reminder defaults for teacher follow-up tasks.
CREATE TABLE "TeacherTaskReminderPolicy" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "dueSoonEnabled" BOOLEAN NOT NULL DEFAULT true,
  "overdueEnabled" BOOLEAN NOT NULL DEFAULT true,
  "overdueFrequencyHours" INTEGER NOT NULL DEFAULT 24,
  "updatedByUserId" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeacherTaskReminderPolicy_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TeacherTaskReminderPolicy_scope_fk" FOREIGN KEY ("schoolId", "organizationId") REFERENCES "School"("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeacherTaskReminderPolicy_frequency_check" CHECK ("overdueFrequencyHours" >= 12 AND "overdueFrequencyHours" <= 168)
);
CREATE UNIQUE INDEX "TeacherTaskReminderPolicy_org_school_key" ON "TeacherTaskReminderPolicy"("organizationId", "schoolId");
CREATE INDEX "TeacherTaskReminderPolicy_scope_idx" ON "TeacherTaskReminderPolicy"("organizationId", "schoolId");
ALTER TABLE "TeacherTaskReminderPolicy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherTaskReminderPolicy" FORCE ROW LEVEL SECURITY;
CREATE POLICY "TeacherTaskReminderPolicy_tenant_policy" ON "TeacherTaskReminderPolicy" USING ("organizationId" = current_setting('app.organization_id', true) AND "schoolId" = current_setting('app.school_id', true)) WITH CHECK ("organizationId" = current_setting('app.organization_id', true) AND "schoolId" = current_setting('app.school_id', true));
