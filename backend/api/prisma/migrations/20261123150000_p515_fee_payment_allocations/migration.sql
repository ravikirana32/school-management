-- P515: invoice-linked fee payments and immutable installment allocations, tenant-isolated.
ALTER TABLE "StudentFeePayment" ADD COLUMN "invoiceId" TEXT;
ALTER TABLE "StudentFeePayment" ADD CONSTRAINT "StudentFeePayment_invoice_scope_fk"
  FOREIGN KEY ("invoiceId", "organizationId", "schoolId")
  REFERENCES "SchoolFeeInvoice"("id", "organizationId", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "StudentFeePayment_school_invoice_idx" ON "StudentFeePayment"("organizationId", "schoolId", "invoiceId");

CREATE TABLE "FeeInstallmentPaymentAllocation" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "installmentId" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeeInstallmentPaymentAllocation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FeeInstallmentPaymentAllocation_payment_scope_fk"
    FOREIGN KEY ("paymentId", "organizationId", "schoolId")
    REFERENCES "StudentFeePayment"("id", "organizationId", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FeeInstallmentPaymentAllocation_installment_scope_fk"
    FOREIGN KEY ("installmentId", "organizationId", "schoolId")
    REFERENCES "FeeInstallment"("id", "organizationId", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "FeeInstallmentPaymentAllocation_amount_ck" CHECK ("amount" > 0)
);
CREATE UNIQUE INDEX "FeeInstallmentPaymentAllocation_id_scope_uq" ON "FeeInstallmentPaymentAllocation"("id", "organizationId", "schoolId");
CREATE UNIQUE INDEX "FeeInstallmentPaymentAllocation_payment_installment_uq" ON "FeeInstallmentPaymentAllocation"("paymentId", "installmentId");
CREATE INDEX "FeeInstallmentPaymentAllocation_school_installment_idx" ON "FeeInstallmentPaymentAllocation"("organizationId", "schoolId", "installmentId");
ALTER TABLE "FeeInstallmentPaymentAllocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeeInstallmentPaymentAllocation" FORCE ROW LEVEL SECURITY;
CREATE POLICY "FeeInstallmentPaymentAllocation_tenant_policy" ON "FeeInstallmentPaymentAllocation"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
