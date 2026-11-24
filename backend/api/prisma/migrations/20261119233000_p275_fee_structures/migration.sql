CREATE TABLE "FeeStructure" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "description" VARCHAR(2000),
  "academicYearId" TEXT,
  "gradeLevelId" TEXT,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
  "components" JSONB NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
  "effectiveFrom" DATE,
  "effectiveTo" DATE,
  "publishedAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FeeStructure_schoolId_code_key" ON "FeeStructure"("schoolId", "code");
CREATE INDEX "FeeStructure_org_school_status_created_idx" ON "FeeStructure"("organizationId", "schoolId", "status", "createdAt");
ALTER TABLE "FeeStructure" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeeStructure" FORCE ROW LEVEL SECURITY;
CREATE POLICY "FeeStructure_tenant_policy" ON "FeeStructure"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
