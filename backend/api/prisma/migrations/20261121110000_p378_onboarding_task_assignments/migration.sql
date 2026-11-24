-- P378: school-scoped onboarding task ownership.
CREATE TABLE IF NOT EXISTS "SchoolOnboardingTaskAssignment" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "taskKey" TEXT NOT NULL,
  "assignedToUserId" TEXT NOT NULL,
  "assignedByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolOnboardingTaskAssignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SchoolOnboardingTaskAssignment_organizationId_schoolId_taskKey_key"
ON "SchoolOnboardingTaskAssignment"("organizationId", "schoolId", "taskKey");
CREATE INDEX IF NOT EXISTS "SchoolOnboardingTaskAssignment_organizationId_schoolId_assignedToUserId_idx"
ON "SchoolOnboardingTaskAssignment"("organizationId", "schoolId", "assignedToUserId");

-- Retrofit tenant row-level security to the P377 progress table and enforce it
-- for the new task-assignment table. Tenant context is set by withTenantContext.
ALTER TABLE "SchoolOnboardingProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolOnboardingProgress" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "SchoolOnboardingProgress_tenant_policy" ON "SchoolOnboardingProgress";
CREATE POLICY "SchoolOnboardingProgress_tenant_policy" ON "SchoolOnboardingProgress"
  USING ("organizationId" = current_setting('app.current_organization_id', true)
    AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true)
    AND "schoolId" = current_setting('app.current_school_id', true));

ALTER TABLE "SchoolOnboardingTaskAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolOnboardingTaskAssignment" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "SchoolOnboardingTaskAssignment_tenant_policy" ON "SchoolOnboardingTaskAssignment";
CREATE POLICY "SchoolOnboardingTaskAssignment_tenant_policy" ON "SchoolOnboardingTaskAssignment"
  USING ("organizationId" = current_setting('app.current_organization_id', true)
    AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true)
    AND "schoolId" = current_setting('app.current_school_id', true));
