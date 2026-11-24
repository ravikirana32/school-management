CREATE TABLE "SchoolExpense" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "expenseNumber" VARCHAR(40) NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "category" VARCHAR(60) NOT NULL,
  "vendorName" VARCHAR(160),
  "description" VARCHAR(2000),
  "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
  "amount" DECIMAL(12,2) NOT NULL,
  "expenseDate" DATE NOT NULL,
  "dueDate" DATE,
  "reference" VARCHAR(120),
  "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  "submittedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "rejectedAt" TIMESTAMP(3),
  "rejectionReason" VARCHAR(1000),
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolExpense_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SchoolExpense_school_expenseNumber_key" ON "SchoolExpense"("schoolId","expenseNumber");
CREATE INDEX "SchoolExpense_org_school_status_date_idx" ON "SchoolExpense"("organizationId","schoolId","status","expenseDate");
CREATE INDEX "SchoolExpense_org_school_category_created_idx" ON "SchoolExpense"("organizationId","schoolId","category","createdAt");

ALTER TABLE "SchoolExpense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolExpense" FORCE ROW LEVEL SECURITY;
CREATE POLICY "SchoolExpense_tenant_policy" ON "SchoolExpense" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
