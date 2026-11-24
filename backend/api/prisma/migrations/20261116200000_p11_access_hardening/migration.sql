CREATE TYPE "StaffInvitationStatus" AS ENUM ('PENDING','ACCEPTED','REVOKED','EXPIRED');
CREATE TABLE "StaffInvitation" (
 "id" TEXT PRIMARY KEY,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,"staffMemberId" TEXT NOT NULL,
 "invitedEmail" TEXT NOT NULL,"tokenHash" TEXT NOT NULL UNIQUE,"status" "StaffInvitationStatus" NOT NULL DEFAULT 'PENDING',
 "expiresAt" TIMESTAMP(3) NOT NULL,"acceptedAt" TIMESTAMP(3),"createdBy" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "StaffInvitation_tenant_email_status_idx" ON "StaffInvitation"("organizationId","schoolId","invitedEmail","status");
CREATE INDEX "StaffInvitation_tenant_staff_idx" ON "StaffInvitation"("organizationId","schoolId","staffMemberId");
ALTER TABLE "StaffInvitation" ADD CONSTRAINT "StaffInvitation_staff_tenant_fk" FOREIGN KEY ("staffMemberId","organizationId","schoolId") REFERENCES "StaffMember"("id","organizationId","schoolId") ON DELETE CASCADE;
ALTER TABLE "StaffInvitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffInvitation" FORCE ROW LEVEL SECURITY;
CREATE POLICY "StaffInvitation_tenant_policy" ON "StaffInvitation" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
-- Ensure existing RBAC join/assignment records are relationally constrained.
CREATE UNIQUE INDEX IF NOT EXISTS "UserRoleAssignment_scope_role_unique" ON "UserRoleAssignment"("userId","roleId","scopeType",COALESCE("organizationId",''),COALESCE("schoolId",''));
