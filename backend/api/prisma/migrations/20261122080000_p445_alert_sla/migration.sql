-- P445: Alert SLA ownership, deadlines and follow-up reminder tracking.
ALTER TABLE "OperationsAlertOutbox" ADD COLUMN IF NOT EXISTS "slaDueAt" TIMESTAMP(3);
ALTER TABLE "OperationsAlertOutbox" ADD COLUMN IF NOT EXISTS "followUpReminderAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "OperationsAlertOutbox_slaDue_idx" ON "OperationsAlertOutbox" ("slaDueAt", "resolvedAt");
CREATE INDEX IF NOT EXISTS "OperationsAlertOutbox_owner_idx" ON "OperationsAlertOutbox" ("assignedToUserId", "resolvedAt");
