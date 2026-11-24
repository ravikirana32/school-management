-- P442: durable escalation lifecycle metadata for operational alerts.
ALTER TABLE "OperationsAlertOutbox"
  ADD COLUMN IF NOT EXISTS "escalatedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "escalationLevel" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "OperationsAlertOutbox_escalation_due_idx"
  ON "OperationsAlertOutbox" ("eventType", "status", "acknowledgedAt", "escalatedAt", "createdAt");
