CREATE TABLE "TransportPersonnel" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "staffUserId" TEXT,
  "personnelType" TEXT NOT NULL, "fullName" TEXT NOT NULL, "phone" TEXT, "email" TEXT,
  "licenseNumber" TEXT, "licenseClass" TEXT, "licenseExpiry" TIMESTAMP(3),
  "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING', "verifiedAt" TIMESTAMP(3), "verifiedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE', "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "TransportPersonnel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TransportPersonnel_org_school_license_key" ON "TransportPersonnel"("organizationId","schoolId","licenseNumber");
CREATE INDEX "TransportPersonnel_org_school_type_status_idx" ON "TransportPersonnel"("organizationId","schoolId","personnelType","status");
CREATE INDEX "TransportPersonnel_org_school_user_idx" ON "TransportPersonnel"("organizationId","schoolId","staffUserId");
CREATE TABLE "TransportPersonnelDocument" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "personnelId" TEXT NOT NULL,
  "documentType" TEXT NOT NULL, "documentNumber" TEXT, "issuedAt" TIMESTAMP(3), "expiresAt" TIMESTAMP(3),
  "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING', "verifiedAt" TIMESTAMP(3), "verifiedBy" TEXT,
  "fileUrl" TEXT, "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TransportPersonnelDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TransportPersonnelDocument_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "TransportPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "TransportPersonnelDocument_org_school_personnel_idx" ON "TransportPersonnelDocument"("organizationId","schoolId","personnelId");
CREATE INDEX "TransportPersonnelDocument_org_school_expiry_idx" ON "TransportPersonnelDocument"("organizationId","schoolId","expiresAt");
