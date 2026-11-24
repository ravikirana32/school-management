CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'LEFT');
CREATE TYPE "ScopeType" AS ENUM ('PLATFORM', 'ORGANIZATION', 'SCHOOL');
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "phone" TEXT UNIQUE,
  "passwordHash" TEXT NOT NULL, "displayName" TEXT NOT NULL,
  "emailVerifiedAt" TIMESTAMP(3), "phoneVerifiedAt" TIMESTAMP(3),
  "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false, "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

CREATE TABLE "Organization" (
  "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL UNIQUE,
  "country" TEXT NOT NULL DEFAULT 'IN', "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "School" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "name" TEXT NOT NULL, "code" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata', "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "School_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "School_organizationId_code_key" UNIQUE ("organizationId","code")
);
CREATE INDEX "School_organizationId_isActive_idx" ON "School"("organizationId","isActive");

CREATE TABLE "OrganizationMembership" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "organizationId" TEXT NOT NULL,
  "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED', "joinedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "OrganizationMembership_userId_organizationId_key" UNIQUE ("userId","organizationId")
);
CREATE INDEX "OrganizationMembership_organizationId_status_idx" ON "OrganizationMembership"("organizationId","status");

CREATE TABLE "SchoolMembership" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED', "joinedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "SchoolMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "SchoolMembership_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE,
  CONSTRAINT "SchoolMembership_userId_schoolId_key" UNIQUE ("userId","schoolId")
);
CREATE INDEX "SchoolMembership_org_school_status_idx" ON "SchoolMembership"("organizationId","schoolId","status");

CREATE TABLE "Role" (
  "id" TEXT PRIMARY KEY, "key" TEXT NOT NULL UNIQUE, "name" TEXT NOT NULL,
  "scopeType" "ScopeType" NOT NULL, "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "organizationId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE
);
CREATE INDEX "Role_organizationId_scopeType_idx" ON "Role"("organizationId","scopeType");

CREATE TABLE "Permission" (
  "id" TEXT PRIMARY KEY, "key" TEXT NOT NULL UNIQUE, "module" TEXT NOT NULL,
  "action" TEXT NOT NULL, "description" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "RolePermission" (
  "id" TEXT PRIMARY KEY, "roleId" TEXT NOT NULL, "permissionId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE,
  CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE,
  CONSTRAINT "RolePermission_roleId_permissionId_key" UNIQUE ("roleId","permissionId")
);
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

CREATE TABLE "UserRoleAssignment" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "roleId" TEXT NOT NULL, "scopeType" "ScopeType" NOT NULL,
  "organizationId" TEXT, "schoolId" TEXT, "assignedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE,
  CONSTRAINT "UserRoleAssignment_org_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "UserRoleAssignment_school_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE
);
CREATE INDEX "UserRoleAssignment_scope_idx" ON "UserRoleAssignment"("userId","scopeType","organizationId","schoolId");

CREATE TABLE "UserSession" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "refreshTokenHash" TEXT NOT NULL UNIQUE,
  "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE', "userAgent" TEXT, "ipAddress" TEXT, "deviceName" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL, "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3), "replacedBySessionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "UserSession_userId_status_idx" ON "UserSession"("userId","status");
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

CREATE TABLE "PasswordResetToken" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL, "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId","expiresAt");

CREATE TABLE "MfaFactor" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "factorType" TEXT NOT NULL,
  "secretCipher" TEXT, "destination" TEXT, "verifiedAt" TIMESTAMP(3), "disabledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MfaFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "MfaFactor_userId_disabledAt_idx" ON "MfaFactor"("userId","disabledAt");

CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY, "actorUserId" TEXT, "organizationId" TEXT, "schoolId" TEXT,
  "action" TEXT NOT NULL, "resourceType" TEXT NOT NULL, "resourceId" TEXT, "outcome" TEXT NOT NULL,
  "ipAddress" TEXT, "userAgent" TEXT, "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId","createdAt");
CREATE INDEX "AuditLog_schoolId_createdAt_idx" ON "AuditLog"("schoolId","createdAt");
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId","createdAt");
