ALTER TABLE "AdmissionApplication" ADD COLUMN "publicTrackingTokenHash" TEXT;
CREATE UNIQUE INDEX "AdmissionApplication_publicTrackingTokenHash_key" ON "AdmissionApplication"("publicTrackingTokenHash");
