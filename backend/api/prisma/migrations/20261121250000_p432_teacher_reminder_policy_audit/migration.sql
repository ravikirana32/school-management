-- P432 append-only audit trail for school reminder policy changes.
CREATE TABLE "TeacherTaskReminderPolicyAudit" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "action" VARCHAR(24) NOT NULL,
  "previousValues" JSONB NOT NULL,
  "newValues" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeacherTaskReminderPolicyAudit_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TeacherTaskReminderPolicyAudit_scope_fk" FOREIGN KEY ("schoolId", "organizationId") REFERENCES "School"("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeacherTaskReminderPolicyAudit_action_check" CHECK ("action" IN ('CREATE', 'UPDATE', 'RESET'))
);
CREATE INDEX "TeacherTaskReminderPolicyAudit_scope_created_idx" ON "TeacherTaskReminderPolicyAudit"("organizationId", "schoolId", "createdAt");
CREATE INDEX "TeacherTaskReminderPolicyAudit_scope_actor_created_idx" ON "TeacherTaskReminderPolicyAudit"("organizationId", "schoolId", "actorUserId", "createdAt");
ALTER TABLE "TeacherTaskReminderPolicyAudit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherTaskReminderPolicyAudit" FORCE ROW LEVEL SECURITY;
CREATE POLICY "TeacherTaskReminderPolicyAudit_tenant_policy" ON "TeacherTaskReminderPolicyAudit" USING ("organizationId" = current_setting('app.organization_id', true) AND "schoolId" = current_setting('app.school_id', true)) WITH CHECK ("organizationId" = current_setting('app.organization_id', true) AND "schoolId" = current_setting('app.school_id', true));

-- Audit rows are immutable at the database layer, not only by API convention.
CREATE FUNCTION "prevent_teacher_task_reminder_policy_audit_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Teacher reminder policy audit records are immutable';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "TeacherTaskReminderPolicyAudit_immutable_trigger"
BEFORE UPDATE OR DELETE ON "TeacherTaskReminderPolicyAudit"
FOR EACH ROW EXECUTE FUNCTION "prevent_teacher_task_reminder_policy_audit_mutation"();
