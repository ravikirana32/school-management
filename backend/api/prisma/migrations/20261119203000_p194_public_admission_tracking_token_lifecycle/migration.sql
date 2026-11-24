ALTER TABLE "AdmissionApplication" ADD COLUMN "publicTrackingTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "AdmissionApplication" ADD COLUMN "publicTrackingTokenRevokedAt" TIMESTAMP(3);
CREATE INDEX "AdmissionApplication_publicTrackingTokenExpiresAt_idx" ON "AdmissionApplication"("publicTrackingTokenExpiresAt");
