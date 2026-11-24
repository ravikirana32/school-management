-- P140: bind refund allocations to an exact operational payment slice.
ALTER TABLE "AccountingHistoricalAllocation"
  ADD COLUMN "targetOperationalPaymentId" TEXT;

CREATE INDEX "AccountingHistoricalAllocation_refund_payment_slice_idx"
  ON "AccountingHistoricalAllocation"("organizationId", "schoolId", "targetOperationalPaymentId");

ALTER TABLE "AccountingHistoricalAllocation"
  ADD CONSTRAINT "AccountingHistoricalAllocation_refund_payment_slice_fk"
  FOREIGN KEY ("targetOperationalPaymentId", "organizationId", "schoolId")
  REFERENCES "StudentFeePayment"("id", "organizationId", "schoolId")
  ON DELETE RESTRICT ON UPDATE CASCADE;
