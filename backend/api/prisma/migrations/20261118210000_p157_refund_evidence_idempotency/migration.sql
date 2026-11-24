ALTER TABLE "StudentFeeRefundReconciliationEvidence"
  ADD COLUMN "idempotencyKey" VARCHAR(128),
  ADD COLUMN "requestFingerprint" VARCHAR(64);
CREATE UNIQUE INDEX "RefundReconEvidence_idempotency_scope_key"
  ON "StudentFeeRefundReconciliationEvidence"("organizationId", "schoolId", "addedByUserId", "idempotencyKey");
