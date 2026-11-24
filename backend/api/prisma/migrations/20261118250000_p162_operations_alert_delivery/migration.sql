-- P162 durable, deduplicated operations alert outbox.
CREATE TABLE IF NOT EXISTS "OperationsAlertOutbox" (
  "id" TEXT PRIMARY KEY,
  "dedupeKey" VARCHAR(180) NOT NULL UNIQUE,
  "eventType" VARCHAR(60) NOT NULL,
  "severity" VARCHAR(16) NOT NULL DEFAULT 'WARNING',
  "payload" JSONB NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastErrorCode" VARCHAR(80),
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "OperationsAlertOutbox_due_idx" ON "OperationsAlertOutbox" ("status", "nextAttemptAt", "createdAt");
