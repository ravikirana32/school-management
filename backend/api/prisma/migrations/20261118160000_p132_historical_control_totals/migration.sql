-- P132: persist operator-declared historical source control totals for independent comparison.
ALTER TABLE "AccountingHistoricalImportBatch"
 ADD COLUMN "declaredChargeTotal" DECIMAL(14,2),
 ADD COLUMN "declaredPaymentTotal" DECIMAL(14,2),
 ADD COLUMN "declaredRefundTotal" DECIMAL(14,2),
 ADD COLUMN "controlTotalsVerifiedAt" TIMESTAMP(3);
ALTER TABLE "AccountingHistoricalImportBatch" ADD CONSTRAINT "AccountingHistoricalImportBatch_control_totals_nonnegative_ck"
 CHECK (("declaredChargeTotal" IS NULL OR "declaredChargeTotal">=0) AND ("declaredPaymentTotal" IS NULL OR "declaredPaymentTotal">=0) AND ("declaredRefundTotal" IS NULL OR "declaredRefundTotal">=0));
ALTER TABLE "AccountingHistoricalImportBatch" ADD CONSTRAINT "AccountingHistoricalImportBatch_control_totals_all_or_none_ck"
 CHECK (("declaredChargeTotal" IS NULL AND "declaredPaymentTotal" IS NULL AND "declaredRefundTotal" IS NULL AND "controlTotalsVerifiedAt" IS NULL) OR ("declaredChargeTotal" IS NOT NULL AND "declaredPaymentTotal" IS NOT NULL AND "declaredRefundTotal" IS NOT NULL AND "controlTotalsVerifiedAt" IS NOT NULL));
