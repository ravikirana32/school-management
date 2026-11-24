CREATE TYPE "TenantLifecycleStatus" AS ENUM ('PROVISIONING','ACTIVE','SUSPENDED','DEACTIVATED','ARCHIVED');
CREATE TYPE "PlatformSettingValueType" AS ENUM ('STRING','NUMBER','BOOLEAN','JSON');

CREATE TABLE "PlatformSetting" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" JSONB NOT NULL,
  "valueType" "PlatformSettingValueType" NOT NULL DEFAULT 'JSON',
  "description" TEXT,
  "isSecret" BOOLEAN NOT NULL DEFAULT false,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "PlatformSetting_updatedAt_idx" ON "PlatformSetting"("updatedAt");

CREATE TABLE "TenantLifecycleEvent" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "fromStatus" "TenantLifecycleStatus",
  "toStatus" "TenantLifecycleStatus" NOT NULL,
  "reason" TEXT NOT NULL,
  "performedBy" TEXT NOT NULL,
  "correlationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TenantLifecycleEvent_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT,
  CONSTRAINT "TenantLifecycleEvent_performedBy_fkey"
    FOREIGN KEY ("performedBy") REFERENCES "User"("id") ON DELETE RESTRICT
);
CREATE INDEX "TenantLifecycleEvent_org_created_idx" ON "TenantLifecycleEvent"("organizationId","createdAt");
CREATE INDEX "TenantLifecycleEvent_actor_created_idx" ON "TenantLifecycleEvent"("performedBy","createdAt");

CREATE TABLE "SupportAccessGrant" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "grantedTo" TEXT NOT NULL,
  "approvedBy" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "ticketReference" TEXT,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportAccessGrant_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT,
  CONSTRAINT "SupportAccessGrant_grantedTo_fkey"
    FOREIGN KEY ("grantedTo") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "SupportAccessGrant_approvedBy_fkey"
    FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE RESTRICT
);
CREATE INDEX "SupportAccessGrant_org_expiry_idx" ON "SupportAccessGrant"("organizationId","expiresAt","revokedAt");
CREATE INDEX "SupportAccessGrant_user_expiry_idx" ON "SupportAccessGrant"("grantedTo","expiresAt");
