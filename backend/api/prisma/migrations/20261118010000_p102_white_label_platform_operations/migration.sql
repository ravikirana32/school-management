BEGIN;

ALTER TABLE "UserSession" ADD COLUMN "mfaVerifiedAt" TIMESTAMP(3);
CREATE TYPE "SupportAccessGrantStatus" AS ENUM ('PENDING_APPROVAL','ACTIVE','REJECTED','REVOKED');
ALTER TABLE "SupportAccessGrant" ALTER COLUMN "approvedBy" DROP NOT NULL;
ALTER TABLE "SupportAccessGrant" ADD COLUMN "requestedBy" TEXT;
ALTER TABLE "SupportAccessGrant" ADD COLUMN "status" "SupportAccessGrantStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "SupportAccessGrant" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "SupportAccessGrant" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "SupportAccessGrant" ADD COLUMN "revokeReason" TEXT;
ALTER TABLE "SupportAccessGrant" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SupportAccessGrant" ADD CONSTRAINT "SupportAccessGrant_requestedBy_fkey"
  FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT;
CREATE INDEX "SupportAccessGrant_org_status_expiry_idx" ON "SupportAccessGrant"("organizationId","status","expiresAt","revokedAt");
CREATE INDEX "SupportAccessGrant_grantee_status_expiry_idx" ON "SupportAccessGrant"("grantedTo","status","expiresAt");

CREATE TYPE "CustomDomainStatus" AS ENUM ('PENDING_VERIFICATION','VERIFIED','ACTIVE','DISABLED');
CREATE TABLE "TenantCustomDomain" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "hostname" TEXT NOT NULL,
 "challengeHash" TEXT NOT NULL, "challengeExpiresAt" TIMESTAMP(3) NOT NULL, "status" "CustomDomainStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
 "verifiedAt" TIMESTAMP(3), "activatedAt" TIMESTAMP(3), "disabledAt" TIMESTAMP(3),
 "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "TenantCustomDomain_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TenantCustomDomain_hostname_key" ON "TenantCustomDomain"("hostname");
CREATE INDEX "TenantCustomDomain_org_status_idx" ON "TenantCustomDomain"("organizationId","status");

CREATE TABLE "TenantBranding" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "brandName" TEXT NOT NULL,
 "primaryColor" TEXT NOT NULL DEFAULT '#24476B', "secondaryColor" TEXT NOT NULL DEFAULT '#F2F5F9',
 "logoUrl" TEXT, "faviconUrl" TEXT, "supportEmail" TEXT, "supportUrl" TEXT, "loginMessage" TEXT,
 "updatedBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "TenantBranding_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TenantBranding_organizationId_key" ON "TenantBranding"("organizationId");
CREATE INDEX "TenantBranding_updatedAt_idx" ON "TenantBranding"("updatedAt");

CREATE TABLE "PlatformSecret" (
 "id" TEXT NOT NULL, "key" TEXT NOT NULL, "ciphertext" TEXT NOT NULL, "nonce" TEXT NOT NULL,
 "authTag" TEXT NOT NULL, "keyVersion" TEXT NOT NULL DEFAULT 'v1', "createdBy" TEXT NOT NULL,
 "updatedBy" TEXT NOT NULL, "rotatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "PlatformSecret_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlatformSecret_key_key" ON "PlatformSecret"("key");
CREATE INDEX "PlatformSecret_updatedAt_idx" ON "PlatformSecret"("updatedAt");

ALTER TABLE "TenantCustomDomain" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantCustomDomain" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_custom_domain_isolation" ON "TenantCustomDomain"
 USING (current_setting('app.is_platform_admin',true)='true' OR "organizationId"=current_setting('app.current_organization_id',true))
 WITH CHECK (current_setting('app.is_platform_admin',true)='true' OR "organizationId"=current_setting('app.current_organization_id',true));
ALTER TABLE "TenantBranding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantBranding" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_branding_isolation" ON "TenantBranding"
 USING (current_setting('app.is_platform_admin',true)='true' OR "organizationId"=current_setting('app.current_organization_id',true))
 WITH CHECK (current_setting('app.is_platform_admin',true)='true' OR "organizationId"=current_setting('app.current_organization_id',true));
ALTER TABLE "PlatformSecret" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlatformSecret" FORCE ROW LEVEL SECURITY;
CREATE POLICY "platform_secret_admin_only" ON "PlatformSecret"
 USING (current_setting('app.is_platform_admin',true)='true')
 WITH CHECK (current_setting('app.is_platform_admin',true)='true');

COMMIT;
