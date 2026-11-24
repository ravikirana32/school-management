-- P138: permit one externally settled historical refund reference to be represented
-- by multiple immutable allocation slices. Allocation IDs remain unique idempotency keys.
DROP INDEX IF EXISTS "StudentFeeRefund_school_settlement_reference_uq";
CREATE INDEX IF NOT EXISTS "StudentFeeRefund_school_settlement_reference_idx"
  ON "StudentFeeRefund"("schoolId", "settlementReference");
