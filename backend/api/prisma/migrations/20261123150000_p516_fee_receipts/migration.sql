-- P516: immutable formal fee receipt snapshot and school receipt numbering.
CREATE TABLE "SchoolFeeReceiptCounter" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "lastSequence" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolFeeReceiptCounter_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SchoolFeeReceiptCounter_sequence_check" CHECK ("lastSequence" >= 0)
);
CREATE UNIQUE INDEX "SchoolFeeReceiptCounter_org_school_key" ON "SchoolFeeReceiptCounter"("organizationId", "schoolId");
ALTER TABLE "SchoolFeeReceiptCounter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolFeeReceiptCounter" FORCE ROW LEVEL SECURITY;
CREATE POLICY "SchoolFeeReceiptCounter_tenant_policy" ON "SchoolFeeReceiptCounter" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));

CREATE TABLE "SchoolFeeReceipt" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "chargeId" TEXT NOT NULL,
  "invoiceId" TEXT,
  "invoiceNumber" TEXT,
  "paymentId" TEXT NOT NULL,
  "receiptNumber" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "paymentMethod" TEXT NOT NULL,
  "paymentReference" TEXT NOT NULL,
  "paidAt" DATE NOT NULL,
  "allocationSnapshot" JSONB NOT NULL,
  "schoolSnapshot" JSONB NOT NULL,
  "issuedBy" TEXT NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SchoolFeeReceipt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SchoolFeeReceipt_payment_scope_fkey" FOREIGN KEY ("paymentId", "organizationId", "schoolId") REFERENCES "StudentFeePayment"("id", "organizationId", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "SchoolFeeReceipt_amount_check" CHECK ("amount" > 0)
);
CREATE UNIQUE INDEX "SchoolFeeReceipt_paymentId_key" ON "SchoolFeeReceipt"("paymentId");
CREATE UNIQUE INDEX "SchoolFeeReceipt_id_org_school_key" ON "SchoolFeeReceipt"("id", "organizationId", "schoolId");
CREATE UNIQUE INDEX "SchoolFeeReceipt_org_school_receiptNumber_key" ON "SchoolFeeReceipt"("organizationId", "schoolId", "receiptNumber");
CREATE INDEX "SchoolFeeReceipt_org_school_student_issuedAt_idx" ON "SchoolFeeReceipt"("organizationId", "schoolId", "studentId", "issuedAt");
ALTER TABLE "SchoolFeeReceipt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolFeeReceipt" FORCE ROW LEVEL SECURITY;
CREATE POLICY "SchoolFeeReceipt_tenant_policy" ON "SchoolFeeReceipt" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
