-- P161: durable cleanup retry scheduling and worker heartbeat.
ALTER TABLE "StudentFeeRefundReconciliationEvidence" ADD COLUMN IF NOT EXISTS "cleanupNextRetryAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "StudentFeeRefundReconciliationEvidence_cleanup_retry_idx" ON "StudentFeeRefundReconciliationEvidence" ("securityStatus", "cleanupNextRetryAt", "createdAt");
CREATE TABLE IF NOT EXISTS "BackgroundWorkerHeartbeat" (
  "workerName" VARCHAR(100) PRIMARY KEY,
  "status" VARCHAR(20) NOT NULL DEFAULT 'STARTING',
  "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSuccessAt" TIMESTAMP(3),
  "lastErrorAt" TIMESTAMP(3),
  "lastErrorCode" VARCHAR(80),
  "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
