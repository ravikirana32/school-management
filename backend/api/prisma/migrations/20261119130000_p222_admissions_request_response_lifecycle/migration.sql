CREATE TABLE IF NOT EXISTS "AdmissionReviewNote" (
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

ALTER TABLE "AdmissionReviewNote"
  ADD COLUMN "applicantResponse" VARCHAR(2000),
  ADD COLUMN "applicantRespondedAt" TIMESTAMP(3),
  ADD COLUMN "responseStatus" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  ADD COLUMN "resolvedAt" TIMESTAMP(3);

CREATE INDEX "AdmissionReviewNote_org_school_app_responseStatus_idx"
  ON "AdmissionReviewNote"("organizationId", "schoolId", "applicationId", "responseStatus");
