ALTER TABLE "AdmissionReviewNote"
  ADD COLUMN "applicantResponse" VARCHAR(2000),
  ADD COLUMN "applicantRespondedAt" TIMESTAMP(3),
  ADD COLUMN "responseStatus" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  ADD COLUMN "resolvedAt" TIMESTAMP(3);

CREATE INDEX "AdmissionReviewNote_org_school_app_responseStatus_idx"
  ON "AdmissionReviewNote"("organizationId", "schoolId", "applicationId", "responseStatus");
