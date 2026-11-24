-- P377: tenant-scoped server persistence for guided onboarding resume.
CREATE TABLE IF NOT EXISTS "SchoolOnboardingProgress" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "currentStepKey" TEXT NOT NULL DEFAULT 'profile',
  "lastSavedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolOnboardingProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SchoolOnboardingProgress_organizationId_schoolId_key"
ON "SchoolOnboardingProgress"("organizationId", "schoolId");
CREATE INDEX IF NOT EXISTS "SchoolOnboardingProgress_organizationId_schoolId_idx"
ON "SchoolOnboardingProgress"("organizationId", "schoolId");
