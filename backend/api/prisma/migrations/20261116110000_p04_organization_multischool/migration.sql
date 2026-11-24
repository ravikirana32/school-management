CREATE TYPE "OrganizationLifecycleStatus" AS ENUM ('PROVISIONING','ACTIVE','SUSPENDED','DEACTIVATED','ARCHIVED');
CREATE TYPE "SchoolLifecycleStatus" AS ENUM ('PROVISIONING','ACTIVE','SUSPENDED','CLOSED');

ALTER TABLE "Organization"
  ADD COLUMN "lifecycleStatus" "OrganizationLifecycleStatus" NOT NULL DEFAULT 'PROVISIONING';
ALTER TABLE "School"
  ADD COLUMN "lifecycleStatus" "SchoolLifecycleStatus" NOT NULL DEFAULT 'PROVISIONING';

-- Align the Prisma model name with the P03 physical table, preserving P01's
-- separate platform_settings table and seed contract.
-- No table rename is needed: PlatformControlSetting maps to "PlatformSetting".

CREATE TABLE "OrganizationInvitation" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT,
  "email" TEXT NOT NULL,
  "roleKey" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "invitedBy" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizationInvitation_org_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "OrganizationInvitation_school_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE,
  CONSTRAINT "OrganizationInvitation_inviter_fkey"
    FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT
);
CREATE INDEX "OrganizationInvitation_org_email_accepted_idx"
  ON "OrganizationInvitation"("organizationId","email","acceptedAt");
CREATE INDEX "OrganizationInvitation_school_email_accepted_idx"
  ON "OrganizationInvitation"("schoolId","email","acceptedAt");
CREATE INDEX "OrganizationInvitation_expiresAt_idx" ON "OrganizationInvitation"("expiresAt");

-- Composite FK ensures a school membership cannot claim a school from another organization.
ALTER TABLE "School" ADD CONSTRAINT "School_id_organizationId_key" UNIQUE ("id","organizationId");
ALTER TABLE "SchoolMembership"
  ADD CONSTRAINT "SchoolMembership_school_org_fkey"
  FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE;

-- Transaction-local settings are populated by withTenantContext(). RLS is forced so
-- application connections must not connect as a superuser/table owner in production.
ALTER TABLE "School" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "School" FORCE ROW LEVEL SECURITY;
CREATE POLICY "school_tenant_isolation" ON "School"
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_platform_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_platform_admin', true) = 'true'
  );

ALTER TABLE "OrganizationMembership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationMembership" FORCE ROW LEVEL SECURITY;
CREATE POLICY "organization_membership_tenant_isolation" ON "OrganizationMembership"
  USING ("organizationId" = current_setting('app.current_organization_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true));
CREATE POLICY "organization_membership_self_read" ON "OrganizationMembership"
  FOR SELECT USING ("userId" = current_setting('app.current_user_id', true));

ALTER TABLE "SchoolMembership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolMembership" FORCE ROW LEVEL SECURITY;
CREATE POLICY "school_membership_tenant_isolation" ON "SchoolMembership"
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    AND ("schoolId" = current_setting('app.current_school_id', true)
      OR current_setting('app.current_school_id', true) = '')
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    AND ("schoolId" = current_setting('app.current_school_id', true)
      OR current_setting('app.current_school_id', true) = '')
  );

ALTER TABLE "UserRoleAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserRoleAssignment" FORCE ROW LEVEL SECURITY;
CREATE POLICY "user_role_assignment_tenant_isolation" ON "UserRoleAssignment"
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    AND ("schoolId" IS NULL OR "schoolId" = current_setting('app.current_school_id', true)
      OR current_setting('app.current_school_id', true) = '')
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    AND ("schoolId" IS NULL OR "schoolId" = current_setting('app.current_school_id', true)
      OR current_setting('app.current_school_id', true) = '')
  );
