-- P136: retain the immutable source allocation while mapping each allocation slice
-- to its own operational payment/refund. Existing P131 one-row links are preserved.
CREATE TABLE "AccountingHistoricalOperationalAllocationLink" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "allocationId" TEXT NOT NULL,
  "historicalRowId" TEXT NOT NULL,
  "operationalChargeId" TEXT NOT NULL,
  "operationalPaymentId" TEXT,
  "operationalRefundId" TEXT,
  "allocatedAmount" DECIMAL(14,2) NOT NULL,
  "linkedBy" TEXT NOT NULL,
  "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_allocation_uq" UNIQUE ("allocationId"),
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_payment_uq" UNIQUE ("operationalPaymentId"),
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_refund_uq" UNIQUE ("operationalRefundId"),
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_id_tenant_uq" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_allocation_fk" FOREIGN KEY ("allocationId","organizationId","schoolId") REFERENCES "AccountingHistoricalAllocation"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_row_fk" FOREIGN KEY ("historicalRowId","organizationId","schoolId") REFERENCES "AccountingHistoricalImportRow"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_charge_fk" FOREIGN KEY ("operationalChargeId","organizationId","schoolId") REFERENCES "StudentFeeCharge"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_payment_fk" FOREIGN KEY ("operationalPaymentId","organizationId","schoolId") REFERENCES "StudentFeePayment"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_refund_fk" FOREIGN KEY ("operationalRefundId","organizationId","schoolId") REFERENCES "StudentFeeRefund"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_amount_ck" CHECK ("allocatedAmount" > 0),
  CONSTRAINT "AccountingHistoricalOperationalAllocationLink_shape_ck" CHECK (("operationalPaymentId" IS NOT NULL AND "operationalRefundId" IS NULL) OR ("operationalPaymentId" IS NULL AND "operationalRefundId" IS NOT NULL))
);
CREATE INDEX "AccountingHistoricalOperationalAllocationLink_source_idx" ON "AccountingHistoricalOperationalAllocationLink"("organizationId","schoolId","historicalRowId","linkedAt");
ALTER TABLE "AccountingHistoricalOperationalAllocationLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccountingHistoricalOperationalAllocationLink" FORCE ROW LEVEL SECURITY;
CREATE POLICY "AccountingHistoricalOperationalAllocationLink_tenant_policy" ON "AccountingHistoricalOperationalAllocationLink"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));

CREATE OR REPLACE FUNCTION validate_historical_operational_allocation_link() RETURNS trigger AS $$
DECLARE allocation_source TEXT; allocation_type TEXT; allocation_amount NUMERIC;
        payment_amount NUMERIC; payment_charge TEXT; refund_amount NUMERIC; refund_payment TEXT;
BEGIN
  SELECT "sourceRowId","allocationType","amount"
    INTO allocation_source,allocation_type,allocation_amount
    FROM "AccountingHistoricalAllocation"
   WHERE "id"=NEW."allocationId" AND "organizationId"=NEW."organizationId" AND "schoolId"=NEW."schoolId";
  IF allocation_source IS DISTINCT FROM NEW."historicalRowId" OR allocation_amount IS DISTINCT FROM NEW."allocatedAmount" THEN
    RAISE EXCEPTION 'Operational allocation link must match its immutable historical allocation source and amount';
  END IF;
  IF allocation_type='PAYMENT_TO_CHARGE' THEN
    IF NEW."operationalPaymentId" IS NULL OR NEW."operationalRefundId" IS NOT NULL THEN
      RAISE EXCEPTION 'Payment-to-charge allocation requires exactly one operational payment';
    END IF;
    SELECT "amount","chargeId" INTO payment_amount,payment_charge FROM "StudentFeePayment"
     WHERE "id"=NEW."operationalPaymentId" AND "organizationId"=NEW."organizationId" AND "schoolId"=NEW."schoolId";
    IF payment_amount IS DISTINCT FROM NEW."allocatedAmount" OR payment_charge IS DISTINCT FROM NEW."operationalChargeId" THEN
      RAISE EXCEPTION 'Operational payment must match the allocated amount and target charge';
    END IF;
  ELSIF allocation_type='REFUND_TO_PAYMENT' THEN
    IF NEW."operationalRefundId" IS NULL OR NEW."operationalPaymentId" IS NOT NULL THEN
      RAISE EXCEPTION 'Refund-to-payment allocation requires exactly one operational refund';
    END IF;
    SELECT "amount","paymentId" INTO refund_amount,refund_payment FROM "StudentFeeRefund"
     WHERE "id"=NEW."operationalRefundId" AND "organizationId"=NEW."organizationId" AND "schoolId"=NEW."schoolId";
    IF refund_amount IS DISTINCT FROM NEW."allocatedAmount" OR NOT EXISTS (
      SELECT 1 FROM "StudentFeePayment" p WHERE p."id"=refund_payment
       AND p."organizationId"=NEW."organizationId" AND p."schoolId"=NEW."schoolId"
       AND p."chargeId"=NEW."operationalChargeId") THEN
      RAISE EXCEPTION 'Operational refund must match the allocated amount and target payment charge';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unsupported historical allocation type';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER "AccountingHistoricalOperationalAllocationLink_validate"
BEFORE INSERT OR UPDATE ON "AccountingHistoricalOperationalAllocationLink"
FOR EACH ROW EXECUTE FUNCTION validate_historical_operational_allocation_link();
