-- P446: idempotency markers for automated SLA notifications.
ALTER TABLE "OperationsAlertOutbox"
  ADD COLUMN IF NOT EXISTS "slaReminderSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "slaEscalationSentAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "OperationsAlertOutbox_slaReminder_idx"
  ON "OperationsAlertOutbox"("slaDueAt", "slaReminderSentAt")
  WHERE "resolvedAt" IS NULL AND "acknowledgedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "OperationsAlertOutbox_slaEscalation_idx"
  ON "OperationsAlertOutbox"("slaDueAt", "slaEscalationSentAt")
  WHERE "resolvedAt" IS NULL AND "acknowledgedAt" IS NULL;
