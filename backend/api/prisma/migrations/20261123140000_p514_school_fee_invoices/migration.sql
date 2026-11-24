-- P514: school fee invoice draft, issue and void lifecycle with tenant RLS.
CREATE TABLE "SchoolFeeInvoice" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "chargeId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "currency" TEXT NOT NULL,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "concessionTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(12,2) NOT NULL,
  "amountDue" DECIMAL(12,2) NOT NULL,
  "issuedAt" TIMESTAMP(3),
  "dueAt" DATE,
  "voidedAt" TIMESTAMP(3),
  "voidReason" VARCHAR(500),
  "billingSnapshot" JSONB NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolFeeInvoice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SchoolFeeInvoice_charge_scope_fkey" FOREIGN KEY ("chargeId", "organizationId", "schoolId") REFERENCES "StudentFeeCharge"("id", "organizationId", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "SchoolFeeInvoice_amounts_check" CHECK ("subtotal" >= 0 AND "concessionTotal" >= 0 AND "total" >= 0 AND "amountDue" >= 0 AND "total" = "subtotal" - "concessionTotal")
);
CREATE UNIQUE INDEX "SchoolFeeInvoice_id_organizationId_schoolId_key" ON "SchoolFeeInvoice"("id", "organizationId", "schoolId");
CREATE UNIQUE INDEX "SchoolFeeInvoice_schoolId_invoiceNumber_key" ON "SchoolFeeInvoice"("schoolId", "invoiceNumber");
CREATE UNIQUE INDEX "SchoolFeeInvoice_chargeId_organizationId_schoolId_key" ON "SchoolFeeInvoice"("chargeId", "organizationId", "schoolId");
CREATE INDEX "SchoolFeeInvoice_school_student_status_created_idx" ON "SchoolFeeInvoice"("organizationId", "schoolId", "studentId", "status", "createdAt");
ALTER TABLE "SchoolFeeInvoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolFeeInvoice" FORCE ROW LEVEL SECURITY;
CREATE POLICY "SchoolFeeInvoice_tenant_policy" ON "SchoolFeeInvoice" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));

CREATE TABLE "SchoolFeeInvoiceLine" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "lineNumber" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
  "grossAmount" DECIMAL(12,2) NOT NULL,
  "concessionAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "netAmount" DECIMAL(12,2) NOT NULL,
  "dueAt" DATE,
  "sourceInstallmentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SchoolFeeInvoiceLine_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SchoolFeeInvoiceLine_invoice_scope_fkey" FOREIGN KEY ("invoiceId", "organizationId", "schoolId") REFERENCES "SchoolFeeInvoice"("id", "organizationId", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SchoolFeeInvoiceLine_amounts_check" CHECK ("quantity" > 0 AND "grossAmount" >= 0 AND "concessionAmount" >= 0 AND "netAmount" >= 0 AND "netAmount" = "grossAmount" - "concessionAmount")
);
CREATE UNIQUE INDEX "SchoolFeeInvoiceLine_invoiceId_lineNumber_key" ON "SchoolFeeInvoiceLine"("invoiceId", "lineNumber");
CREATE UNIQUE INDEX "SchoolFeeInvoiceLine_id_organizationId_schoolId_key" ON "SchoolFeeInvoiceLine"("id", "organizationId", "schoolId");
CREATE INDEX "SchoolFeeInvoiceLine_school_invoice_idx" ON "SchoolFeeInvoiceLine"("organizationId", "schoolId", "invoiceId");
ALTER TABLE "SchoolFeeInvoiceLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolFeeInvoiceLine" FORCE ROW LEVEL SECURITY;
CREATE POLICY "SchoolFeeInvoiceLine_tenant_policy" ON "SchoolFeeInvoiceLine" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
