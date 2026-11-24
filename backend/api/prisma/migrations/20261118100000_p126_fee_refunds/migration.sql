-- P126: request/approval/settlement lifecycle for manual fee-payment refunds.
-- This records reconciliation evidence only; it does not move funds.
ALTER TABLE "StudentFeePayment" ADD CONSTRAINT "StudentFeePayment_id_org_school_student_charge_uq" UNIQUE ("id", "organizationId", "schoolId", "studentId", "chargeId");

CREATE TABLE "StudentFeeRefund" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "chargeId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
  "reason" VARCHAR(1000) NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'REQUESTED',
  "idempotencyKey" VARCHAR(120) NOT NULL,
  "requestedBy" TEXT NOT NULL,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "rejectedBy" TEXT,
  "rejectedAt" TIMESTAMP(3),
  "rejectionReason" VARCHAR(1000),
  "settledBy" TEXT,
  "settledAt" TIMESTAMP(3),
  "settlementReference" VARCHAR(120),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentFeeRefund_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentFeeRefund_id_org_school_uq" UNIQUE ("id", "organizationId", "schoolId"),
  CONSTRAINT "StudentFeeRefund_payment_fk" FOREIGN KEY ("paymentId", "organizationId", "schoolId", "studentId", "chargeId")
    REFERENCES "StudentFeePayment"("id", "organizationId", "schoolId", "studentId", "chargeId") ON DELETE RESTRICT,
  CONSTRAINT "StudentFeeRefund_amount_ck" CHECK ("amount" > 0),
  CONSTRAINT "StudentFeeRefund_status_ck" CHECK ("status" IN ('REQUESTED','APPROVED_PENDING_SETTLEMENT','REJECTED','SETTLED')),
  CONSTRAINT "StudentFeeRefund_settlement_fields_ck" CHECK (
    ("status" = 'SETTLED' AND "settledBy" IS NOT NULL AND "settledAt" IS NOT NULL AND "settlementReference" IS NOT NULL)
    OR ("status" <> 'SETTLED' AND "settledBy" IS NULL AND "settledAt" IS NULL AND "settlementReference" IS NULL)
  )
);
CREATE UNIQUE INDEX "StudentFeeRefund_school_idempotency_uq" ON "StudentFeeRefund"("schoolId", "idempotencyKey");
CREATE UNIQUE INDEX "StudentFeeRefund_school_settlement_reference_uq" ON "StudentFeeRefund"("schoolId", "settlementReference");
CREATE INDEX "StudentFeeRefund_payment_status_idx" ON "StudentFeeRefund"("organizationId", "schoolId", "paymentId", "status");
CREATE INDEX "StudentFeeRefund_student_created_idx" ON "StudentFeeRefund"("organizationId", "schoolId", "studentId", "createdAt");

CREATE TABLE "StudentFeeRefundEvent" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "refundId" TEXT NOT NULL,
  "eventType" VARCHAR(40) NOT NULL,
  "fromStatus" VARCHAR(32),
  "toStatus" VARCHAR(32) NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "note" VARCHAR(1000),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentFeeRefundEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentFeeRefundEvent_refund_fk" FOREIGN KEY ("refundId", "organizationId", "schoolId")
    REFERENCES "StudentFeeRefund"("id", "organizationId", "schoolId") ON DELETE RESTRICT
);
CREATE INDEX "StudentFeeRefundEvent_refund_created_idx" ON "StudentFeeRefundEvent"("organizationId", "schoolId", "refundId", "createdAt");

ALTER TABLE "StudentFeePayment" DROP CONSTRAINT IF EXISTS "StudentFeePayment_status_ck";
ALTER TABLE "StudentFeePayment" ADD CONSTRAINT "StudentFeePayment_status_ck"
  CHECK ("status" IN ('RECORDED','REVERSED','PARTIALLY_REFUNDED'));

DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['StudentFeeRefund','StudentFeeRefundEvent'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true))',t||'_tenant_policy',t);
END LOOP; END $$;

-- Event history is append-only at the database layer, not merely by application convention.
CREATE OR REPLACE FUNCTION prevent_student_fee_refund_event_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'StudentFeeRefundEvent is append-only';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "StudentFeeRefundEvent_append_only"
  BEFORE UPDATE OR DELETE ON "StudentFeeRefundEvent"
  FOR EACH ROW EXECUTE FUNCTION prevent_student_fee_refund_event_mutation();

CREATE TRIGGER "StudentFeeRefundEvent_no_truncate"
  BEFORE TRUNCATE ON "StudentFeeRefundEvent"
  FOR EACH STATEMENT EXECUTE FUNCTION prevent_student_fee_refund_event_mutation();
