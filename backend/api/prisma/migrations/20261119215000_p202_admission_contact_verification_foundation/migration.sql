ALTER TABLE "AdmissionApplication" ADD COLUMN "guardianPhoneVerifiedAt" TIMESTAMP(3);
ALTER TABLE "AdmissionApplication" ADD COLUMN "guardianEmailVerifiedAt" TIMESTAMP(3);
CREATE TABLE "AdmissionContactVerification" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "targetHash" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "verifiedAt" TIMESTAMP(3),
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdmissionContactVerification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdmissionContactVerification_org_school_app_channel_created_idx" ON "AdmissionContactVerification"("organizationId", "schoolId", "applicationId", "channel", "createdAt");
CREATE INDEX "AdmissionContactVerification_expiry_state_idx" ON "AdmissionContactVerification"("expiresAt", "verifiedAt", "consumedAt");
