-- P562: transport GPS provider abstraction, explicit consent and retention
CREATE TABLE "TransportGpsConfig" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "enabled" BOOLEAN NOT NULL DEFAULT false, "provider" TEXT NOT NULL DEFAULT 'GENERIC',
 "retentionDays" INTEGER NOT NULL DEFAULT 7, "updateIntervalSeconds" INTEGER NOT NULL DEFAULT 60,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "TransportGpsConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TransportGpsConfig_organizationId_schoolId_key" ON "TransportGpsConfig"("organizationId","schoolId");
CREATE TABLE "TransportGpsConsent" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "personnelId" TEXT NOT NULL,
 "consentGranted" BOOLEAN NOT NULL DEFAULT false, "grantedAt" TIMESTAMP(3), "revokedAt" TIMESTAMP(3),
 "consentVersion" TEXT NOT NULL DEFAULT '1', "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "TransportGpsConsent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TransportGpsConsent_organizationId_schoolId_personnelId_key" ON "TransportGpsConsent"("organizationId","schoolId","personnelId");
CREATE INDEX "TransportGpsConsent_organizationId_schoolId_consentGranted_idx" ON "TransportGpsConsent"("organizationId","schoolId","consentGranted");
CREATE TABLE "TransportLocationPing" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "personnelId" TEXT NOT NULL,
 "tripId" TEXT, "provider" TEXT NOT NULL DEFAULT 'GENERIC', "latitude" DECIMAL(10,7) NOT NULL,
 "longitude" DECIMAL(10,7) NOT NULL, "accuracyMeters" DECIMAL(8,2), "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "expiresAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "TransportLocationPing_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TransportLocationPing_organizationId_schoolId_personnelId_capturedAt_idx" ON "TransportLocationPing"("organizationId","schoolId","personnelId","capturedAt");
CREATE INDEX "TransportLocationPing_organizationId_schoolId_tripId_capturedAt_idx" ON "TransportLocationPing"("organizationId","schoolId","tripId","capturedAt");
CREATE INDEX "TransportLocationPing_expiresAt_idx" ON "TransportLocationPing"("expiresAt");
