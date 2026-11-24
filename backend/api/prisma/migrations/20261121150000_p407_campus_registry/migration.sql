-- P407: tenant-scoped campus registry foundation.
CREATE TABLE IF NOT EXISTS "SchoolCampus" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "campusCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "isMain" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SchoolCampus_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SchoolCampus_status_check" CHECK ("status" IN ('ACTIVE','INACTIVE','ARCHIVED')),
  CONSTRAINT "SchoolCampus_code_nonempty_check" CHECK (length(trim("campusCode")) > 0),
  CONSTRAINT "SchoolCampus_name_nonempty_check" CHECK (length(trim("name")) > 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS "SchoolCampus_org_school_code_key" ON "SchoolCampus"("organizationId","schoolId",upper("campusCode"));
CREATE UNIQUE INDEX IF NOT EXISTS "SchoolCampus_single_main_idx" ON "SchoolCampus"("organizationId","schoolId") WHERE "isMain" = TRUE AND "status" = 'ACTIVE';
CREATE INDEX IF NOT EXISTS "SchoolCampus_org_school_status_idx" ON "SchoolCampus"("organizationId","schoolId","status");
ALTER TABLE "SchoolCampus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolCampus" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "SchoolCampus_tenant_policy" ON "SchoolCampus";
CREATE POLICY "SchoolCampus_tenant_policy" ON "SchoolCampus" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
