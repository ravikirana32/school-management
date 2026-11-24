CREATE TABLE "AdmissionEligibilityRule" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL,
  "gradeLevelId" TEXT NOT NULL,
  "boardCode" TEXT NOT NULL DEFAULT 'ANY',
  "minAgeMonths" INTEGER,
  "maxAgeMonths" INTEGER,
  "ageCutoffDate" DATE,
  "requiredDocuments" JSONB NOT NULL DEFAULT '[]',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdmissionEligibilityRule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdmissionEligibilityRule_schoolId_academicYearId_gradeLevelId_boardCode_key" ON "AdmissionEligibilityRule"("schoolId","academicYearId","gradeLevelId","boardCode");
CREATE INDEX "AdmissionEligibilityRule_organizationId_schoolId_academicYearId_enabled_idx" ON "AdmissionEligibilityRule"("organizationId","schoolId","academicYearId","enabled");
