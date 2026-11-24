-- P331 Applicant account access: OTP challenges and short-lived email sessions
CREATE TABLE "ApplicantAccountChallenge" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "email" TEXT NOT NULL,
  "emailHash" TEXT NOT NULL, "codeHash" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0, "verifiedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicantAccountChallenge_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ApplicantAccountChallenge_org_school_email_created_idx" ON "ApplicantAccountChallenge"("organizationId","schoolId","emailHash","createdAt");
CREATE INDEX "ApplicantAccountChallenge_expiry_verified_idx" ON "ApplicantAccountChallenge"("expiresAt","verifiedAt");
CREATE TABLE "ApplicantAccountSession" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "email" TEXT NOT NULL,
  "emailHash" TEXT NOT NULL, "tokenHash" TEXT NOT NULL UNIQUE, "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicantAccountSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ApplicantAccountSession_org_school_email_exp_idx" ON "ApplicantAccountSession"("organizationId","schoolId","emailHash","expiresAt");
