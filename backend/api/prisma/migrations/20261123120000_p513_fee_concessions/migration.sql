-- P513: student fee concessions / scholarships with independent approval
CREATE TABLE "FeeConcession" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "chargeId" TEXT NOT NULL,
  "type" VARCHAR(16) NOT NULL,
  "value" DECIMAL(12,2) NOT NULL,
  "calculatedAmount" DECIMAL(12,2) NOT NULL,
  "reason" VARCHAR(500) NOT NULL,
  "status" VARCHAR(24) NOT NULL DEFAULT 'DRAFT',
  "requestedBy" TEXT NOT NULL,
  "decidedBy" TEXT,
  "decisionReason" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeeConcession_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FeeConcession_charge_scope_fkey" FOREIGN KEY ("chargeId", "organizationId", "schoolId") REFERENCES "StudentFeeCharge"("id", "organizationId", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FeeConcession_type_value_check" CHECK (("type" = 'FIXED' AND "value" > 0) OR ("type" = 'PERCENTAGE' AND "value" > 0 AND "value" <= 100)),
  CONSTRAINT "FeeConcession_calculated_amount_check" CHECK ("calculatedAmount" > 0)
);
CREATE UNIQUE INDEX "FeeConcession_id_organizationId_schoolId_key" ON "FeeConcession"("id", "organizationId", "schoolId");
CREATE INDEX "fee_conc_student_status_idx" ON "FeeConcession"("organizationId", "schoolId", "studentId", "status", "createdAt");
CREATE INDEX "fee_conc_charge_status_idx" ON "FeeConcession"("organizationId", "schoolId", "chargeId", "status");
ALTER TABLE "FeeConcession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeeConcession" FORCE ROW LEVEL SECURITY;
CREATE POLICY "FeeConcession_tenant_policy" ON "FeeConcession"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
