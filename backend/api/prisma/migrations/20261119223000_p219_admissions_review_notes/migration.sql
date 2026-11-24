CREATE TABLE "AdmissionReviewNote" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "noteType" TEXT NOT NULL,
  "noteText" VARCHAR(2000) NOT NULL,
  "recommendation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdmissionReviewNote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdmissionReviewNote_org_school_application_created_idx" ON "AdmissionReviewNote"("organizationId", "schoolId", "applicationId", "createdAt");
CREATE INDEX "AdmissionReviewNote_org_school_reviewer_created_idx" ON "AdmissionReviewNote"("organizationId", "schoolId", "reviewerId", "createdAt");
