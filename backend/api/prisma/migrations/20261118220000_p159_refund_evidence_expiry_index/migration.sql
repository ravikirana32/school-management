-- Supports bounded scheduled cleanup of abandoned refund evidence uploads.
CREATE INDEX IF NOT EXISTS "StudentFeeRefundReconciliationEvidence_securityStatus_referenceType_createdAt_idx"
ON "StudentFeeRefundReconciliationEvidence" ("securityStatus", "referenceType", "createdAt");
