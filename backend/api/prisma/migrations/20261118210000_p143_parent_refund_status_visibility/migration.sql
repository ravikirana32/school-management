-- P143: explicitly publish refund status to verified parent portal accounts.
ALTER TABLE "StudentFeeRefund"
  ADD COLUMN "parentVisibleAt" TIMESTAMP(3),
  ADD COLUMN "parentVisibleBy" TEXT;

CREATE INDEX "StudentFeeRefund_parent_visibility_idx"
  ON "StudentFeeRefund"("organizationId", "schoolId", "studentId", "parentVisibleAt");
