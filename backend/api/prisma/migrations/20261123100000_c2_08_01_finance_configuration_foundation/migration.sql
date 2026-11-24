-- C2-08-01 Finance configuration foundation
CREATE TABLE IF NOT EXISTS "SchoolFinanceConfiguration" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "configuration" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "updatedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SchoolFinanceConfiguration_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SchoolFinanceConfiguration_schoolId_key" UNIQUE ("schoolId"),
  CONSTRAINT "SchoolFinanceConfiguration_org_school_key" UNIQUE ("organizationId", "schoolId")
);
CREATE INDEX IF NOT EXISTS "SchoolFinanceConfiguration_org_school_idx" ON "SchoolFinanceConfiguration"("organizationId", "schoolId");
ALTER TABLE "SchoolFinanceConfiguration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolFinanceConfiguration" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "SchoolFinanceConfiguration_tenant_isolation" ON "SchoolFinanceConfiguration";
CREATE POLICY "SchoolFinanceConfiguration_tenant_isolation" ON "SchoolFinanceConfiguration"
USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
