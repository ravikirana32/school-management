-- Persist retryable storage-cleanup failures for refund evidence uploads.
ALTER TABLE "StudentFeeRefundReconciliationEvidence"
  ADD COLUMN IF NOT EXISTS "cleanupLastErrorAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cleanupAttemptCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "cleanupLastErrorCode" VARCHAR(80);

CREATE INDEX IF NOT EXISTS "StudentFeeRefundReconciliationEvidence_cleanupLastErrorAt_idx"
ON "StudentFeeRefundReconciliationEvidence" ("organizationId", "schoolId", "cleanupLastErrorAt");
