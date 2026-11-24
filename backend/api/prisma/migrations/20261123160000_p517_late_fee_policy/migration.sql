CREATE TABLE "FeeLateFeePolicy" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "calculationType" TEXT NOT NULL DEFAULT 'FIXED',
  "fixedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "percentage" DECIMAL(7,4) NOT NULL DEFAULT 0,
  "graceDays" INTEGER NOT NULL DEFAULT 0,
  "capAmount" DECIMAL(12,2),
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "appliesPerPeriod" BOOLEAN NOT NULL DEFAULT false,
  "updatedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeeLateFeePolicy_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FeeLateFeePolicy_calc_check" CHECK ("calculationType" IN ('FIXED','PERCENTAGE')),
  CONSTRAINT "FeeLateFeePolicy_nonnegative_check" CHECK ("fixedAmount" >= 0 AND "percentage" >= 0 AND "graceDays" >= 0 AND ("capAmount" IS NULL OR "capAmount" >= 0))
);
CREATE UNIQUE INDEX "FeeLateFeePolicy_org_school_key" ON "FeeLateFeePolicy"("organizationId","schoolId");
ALTER TABLE "FeeLateFeePolicy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeeLateFeePolicy" FORCE ROW LEVEL SECURITY;
CREATE POLICY "FeeLateFeePolicy_tenant_policy" ON "FeeLateFeePolicy" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
