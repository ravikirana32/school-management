-- P403 tenant-scoped campus inheritance document persistence.
CREATE TABLE IF NOT EXISTS "CampusConfigInheritanceRecord" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "campusId" TEXT NOT NULL, "parentCampusId" TEXT, "configDocument" JSONB NOT NULL,
 "updatedBy" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "CampusConfigInheritanceRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CampusConfigInheritanceRecord_org_school_campus_key" ON "CampusConfigInheritanceRecord"("organizationId","schoolId","campusId");
CREATE INDEX IF NOT EXISTS "CampusConfigInheritanceRecord_org_school_parent_idx" ON "CampusConfigInheritanceRecord"("organizationId","schoolId","parentCampusId");
ALTER TABLE "CampusConfigInheritanceRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CampusConfigInheritanceRecord" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "CampusConfigInheritanceRecord_tenant_policy" ON "CampusConfigInheritanceRecord";
CREATE POLICY "CampusConfigInheritanceRecord_tenant_policy" ON "CampusConfigInheritanceRecord" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
