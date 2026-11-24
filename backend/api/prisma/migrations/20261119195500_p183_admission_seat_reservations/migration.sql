CREATE TABLE "AdmissionSeatReservation" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "capacityId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "expiresAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  "releaseReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdmissionSeatReservation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdmissionSeatReservation_offerId_key" ON "AdmissionSeatReservation"("offerId");
CREATE INDEX "AdmissionSeatReservation_org_school_status_expiry_idx" ON "AdmissionSeatReservation"("organizationId", "schoolId", "status", "expiresAt");
CREATE INDEX "AdmissionSeatReservation_org_school_application_idx" ON "AdmissionSeatReservation"("organizationId", "schoolId", "applicationId");
