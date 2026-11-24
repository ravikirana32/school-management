-- P444 alert acknowledgement, assignment, resolution and lifecycle history.
ALTER TABLE "OperationsAlertOutbox"
  ADD COLUMN IF NOT EXISTS "acknowledgementNote" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "assignedToUserId" TEXT,
  ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "resolvedByUserId" TEXT,
  ADD COLUMN IF NOT EXISTS "resolutionNote" VARCHAR(1000);
CREATE INDEX IF NOT EXISTS "OperationsAlertOutbox_lifecycle_idx"
  ON "OperationsAlertOutbox" ("resolvedAt", "acknowledgedAt", "assignedToUserId", "createdAt" DESC);
CREATE TABLE IF NOT EXISTS "OperationsAlertLifecycleHistory" (
  "id" TEXT PRIMARY KEY,
  "alertId" TEXT NOT NULL,
  "action" VARCHAR(24) NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "comment" VARCHAR(1000),
  "previousValue" JSONB,
  "newValue" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "OperationsAlertLifecycleHistory_alert_idx"
  ON "OperationsAlertLifecycleHistory" ("alertId", "createdAt" DESC);
