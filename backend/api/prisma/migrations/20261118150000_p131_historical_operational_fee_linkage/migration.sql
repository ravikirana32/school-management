-- P131: controlled operational fee-table materialization for already-posted historical accounting rows.
-- Align the historical operational fee workflow with the Prisma field already used by fee APIs.
ALTER TABLE "StudentFeeCharge" ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT NOT NULL DEFAULT 'DRAFT';
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='StudentFeeCharge_approval_status_ck') THEN
  ALTER TABLE "StudentFeeCharge" ADD CONSTRAINT "StudentFeeCharge_approval_status_ck" CHECK ("approvalStatus" IN ('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED'));
 END IF;
END $$;
ALTER TABLE "AccountingHistoricalImportRow" ADD COLUMN "relatedChargeSourceReference" VARCHAR(120);
ALTER TABLE "AccountingHistoricalImportRow" ADD COLUMN "relatedPaymentSourceReference" VARCHAR(120);
ALTER TABLE "AccountingHistoricalImportRow" ADD CONSTRAINT "AccountingHistoricalImportRow_operational_parent_ck" CHECK (("sourceType" <> 'PAYMENT' OR NULLIF(BTRIM("relatedChargeSourceReference"),'') IS NOT NULL) AND ("sourceType" <> 'REFUND' OR NULLIF(BTRIM("relatedPaymentSourceReference"),'') IS NOT NULL));
CREATE TABLE "AccountingHistoricalOperationalLink" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "historicalRowId" TEXT NOT NULL,
 "operationalChargeId" TEXT NOT NULL, "operationalPaymentId" TEXT, "operationalRefundId" TEXT, "linkedBy" TEXT NOT NULL, "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AccountingHistoricalOperationalLink_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AccountingHistoricalOperationalLink_row_uq" UNIQUE ("historicalRowId"),
 CONSTRAINT "AccountingHistoricalOperationalLink_refund_uq" UNIQUE ("operationalRefundId"),
 CONSTRAINT "AccountingHistoricalOperationalLink_id_tenant_uq" UNIQUE ("id","organizationId","schoolId"),
 CONSTRAINT "AccountingHistoricalOperationalLink_row_fk" FOREIGN KEY ("historicalRowId","organizationId","schoolId") REFERENCES "AccountingHistoricalImportRow"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingHistoricalOperationalLink_charge_fk" FOREIGN KEY ("operationalChargeId","organizationId","schoolId") REFERENCES "StudentFeeCharge"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingHistoricalOperationalLink_payment_id_fk" FOREIGN KEY ("operationalPaymentId") REFERENCES "StudentFeePayment"("id") ON DELETE RESTRICT,
 CONSTRAINT "AccountingHistoricalOperationalLink_refund_id_fk" FOREIGN KEY ("operationalRefundId") REFERENCES "StudentFeeRefund"("id") ON DELETE RESTRICT,
 CONSTRAINT "AccountingHistoricalOperationalLink_payment_fk" FOREIGN KEY ("operationalPaymentId","organizationId","schoolId") REFERENCES "StudentFeePayment"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingHistoricalOperationalLink_refund_fk" FOREIGN KEY ("operationalRefundId","organizationId","schoolId") REFERENCES "StudentFeeRefund"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingHistoricalOperationalLink_shape_ck" CHECK ("operationalChargeId" IS NOT NULL)
);
CREATE INDEX "AccountingHistoricalOperationalLink_tenant_linked_idx" ON "AccountingHistoricalOperationalLink"("organizationId","schoolId","linkedAt");
ALTER TABLE "AccountingHistoricalOperationalLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccountingHistoricalOperationalLink" FORCE ROW LEVEL SECURITY;
CREATE POLICY "AccountingHistoricalOperationalLink_tenant_policy" ON "AccountingHistoricalOperationalLink" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
CREATE OR REPLACE FUNCTION validate_historical_operational_link() RETURNS trigger AS $$
DECLARE source_type TEXT; source_student TEXT; source_batch TEXT; source_reference TEXT; charge_source_reference TEXT; payment_source_reference TEXT; source_amount NUMERIC; source_date DATE; source_settlement_reference TEXT; batch_status TEXT; batch_currency TEXT; operational_student TEXT; operational_charge TEXT; operational_currency TEXT; operational_amount NUMERIC; operational_reference TEXT; operational_date DATE; operational_status TEXT; operational_charge_code TEXT; operational_charge_date DATE; operational_approval_status TEXT; operational_charge_status TEXT; payment_amount NUMERIC; payment_date DATE;
BEGIN
 SELECT r."sourceType",r."studentId",r."batchId",r."sourceReference",r."relatedChargeSourceReference",r."relatedPaymentSourceReference",r."amount",r."originalTransactionDate",r."externalSettlementReference",b."status",b."currency"
 INTO source_type,source_student,source_batch,source_reference,charge_source_reference,payment_source_reference,source_amount,source_date,source_settlement_reference,batch_status,batch_currency
 FROM "AccountingHistoricalImportRow" r JOIN "AccountingHistoricalImportBatch" b ON b."id"=r."batchId" AND b."organizationId"=r."organizationId" AND b."schoolId"=r."schoolId"
 WHERE r."id"=NEW."historicalRowId" AND r."organizationId"=NEW."organizationId" AND r."schoolId"=NEW."schoolId";
 IF source_type IS NULL OR batch_status <> 'POSTED' THEN RAISE EXCEPTION 'Operational links require a posted historical import row'; END IF;
 SELECT "studentId","currency","amount","chargeCode","publishedAt"::date,"approvalStatus","status" INTO operational_student,operational_currency,operational_amount,operational_charge_code,operational_charge_date,operational_approval_status,operational_charge_status FROM "StudentFeeCharge" WHERE "id"=NEW."operationalChargeId" AND "organizationId"=NEW."organizationId" AND "schoolId"=NEW."schoolId";
 IF operational_student IS DISTINCT FROM source_student OR operational_currency IS DISTINCT FROM batch_currency THEN RAISE EXCEPTION 'Operational charge does not match historical student or currency'; END IF;
 IF source_type='CHARGE' THEN
  IF operational_amount IS DISTINCT FROM source_amount OR operational_charge_date IS DISTINCT FROM source_date OR operational_approval_status <> 'APPROVED' OR operational_charge_status <> 'PUBLISHED' OR operational_charge_code IS DISTINCT FROM left(regexp_replace('HIST-'||source_reference, '[^A-Za-z0-9_-]', '-', 'g'),50) THEN RAISE EXCEPTION 'Operational charge does not match historical charge reference/date/approval'; END IF;
  IF NEW."operationalPaymentId" IS NOT NULL OR NEW."operationalRefundId" IS NOT NULL THEN RAISE EXCEPTION 'Historical charge link cannot include payment or refund'; END IF;
 ELSIF source_type='PAYMENT' THEN
  IF NEW."operationalPaymentId" IS NULL OR NEW."operationalRefundId" IS NOT NULL THEN RAISE EXCEPTION 'Historical payment link requires exactly one operational payment'; END IF;
  IF NOT EXISTS (SELECT 1 FROM "AccountingHistoricalImportRow" cr JOIN "AccountingHistoricalOperationalLink" cl ON cl."historicalRowId"=cr."id" AND cl."organizationId"=cr."organizationId" AND cl."schoolId"=cr."schoolId" WHERE cr."batchId"=source_batch AND cr."sourceType"='CHARGE' AND cr."sourceReference"=charge_source_reference AND cr."studentId"=source_student AND cl."operationalChargeId"=NEW."operationalChargeId") THEN RAISE EXCEPTION 'Historical payment charge source link is missing or mismatched'; END IF;
  SELECT "studentId","chargeId","currency","amount","reference","paidAt","status" INTO operational_student,operational_charge,operational_currency,operational_amount,operational_reference,operational_date,operational_status FROM "StudentFeePayment" WHERE "id"=NEW."operationalPaymentId" AND "organizationId"=NEW."organizationId" AND "schoolId"=NEW."schoolId";
  IF operational_student IS DISTINCT FROM source_student OR operational_charge IS DISTINCT FROM NEW."operationalChargeId" OR operational_currency IS DISTINCT FROM batch_currency OR operational_amount IS DISTINCT FROM source_amount OR operational_reference IS DISTINCT FROM source_reference OR operational_date IS DISTINCT FROM source_date OR operational_date < operational_charge_date OR operational_status <> 'RECORDED' OR (SELECT COALESCE(SUM(p.amount),0) FROM "StudentFeePayment" p WHERE p."chargeId"=NEW."operationalChargeId" AND p."organizationId"=NEW."organizationId" AND p."schoolId"=NEW."schoolId") > (SELECT c."amount" FROM "StudentFeeCharge" c WHERE c."id"=NEW."operationalChargeId" AND c."organizationId"=NEW."organizationId" AND c."schoolId"=NEW."schoolId") THEN RAISE EXCEPTION 'Operational payment does not match historical payment source'; END IF;
 ELSIF source_type='REFUND' THEN
  IF NEW."operationalPaymentId" IS NULL OR NEW."operationalRefundId" IS NULL THEN RAISE EXCEPTION 'Historical refund link requires operational payment and refund'; END IF;
  IF NOT EXISTS (SELECT 1 FROM "AccountingHistoricalImportRow" pr JOIN "AccountingHistoricalOperationalLink" pl ON pl."historicalRowId"=pr."id" AND pl."organizationId"=pr."organizationId" AND pl."schoolId"=pr."schoolId" WHERE pr."batchId"=source_batch AND pr."sourceType"='PAYMENT' AND pr."sourceReference"=payment_source_reference AND pr."studentId"=source_student AND pl."operationalPaymentId"=NEW."operationalPaymentId" AND pl."operationalChargeId"=NEW."operationalChargeId") THEN RAISE EXCEPTION 'Historical refund payment source link is missing or mismatched'; END IF;
  SELECT p."amount",p."paidAt" INTO payment_amount,payment_date FROM "StudentFeePayment" p WHERE p."id"=NEW."operationalPaymentId" AND p."organizationId"=NEW."organizationId" AND p."schoolId"=NEW."schoolId";
  IF payment_date IS NULL OR source_date < payment_date OR NOT EXISTS (SELECT 1 FROM "StudentFeeRefund" rf WHERE rf."id"=NEW."operationalRefundId" AND rf."organizationId"=NEW."organizationId" AND rf."schoolId"=NEW."schoolId" AND rf."studentId"=source_student AND rf."chargeId"=NEW."operationalChargeId" AND rf."paymentId"=NEW."operationalPaymentId" AND rf."currency"=batch_currency AND rf."amount"=source_amount AND rf."status"='SETTLED' AND rf."settlementReference"=source_settlement_reference AND rf."settledAt"=source_date) OR (SELECT COALESCE(SUM(rf."amount"),0) FROM "StudentFeeRefund" rf WHERE rf."paymentId"=NEW."operationalPaymentId" AND rf."organizationId"=NEW."organizationId" AND rf."schoolId"=NEW."schoolId" AND rf."status"='SETTLED') > payment_amount THEN RAISE EXCEPTION 'Operational refund does not match historical refund evidence'; END IF;
 ELSE RAISE EXCEPTION 'Unsupported historical source type';
 END IF;
 RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER "AccountingHistoricalOperationalLink_validate" BEFORE INSERT ON "AccountingHistoricalOperationalLink" FOR EACH ROW EXECUTE FUNCTION validate_historical_operational_link();
CREATE OR REPLACE FUNCTION reject_historical_operational_link_mutation() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'Historical operational links are append-only'; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER "AccountingHistoricalOperationalLink_append_only" BEFORE UPDATE OR DELETE OR TRUNCATE ON "AccountingHistoricalOperationalLink" FOR EACH STATEMENT EXECUTE FUNCTION reject_historical_operational_link_mutation();
