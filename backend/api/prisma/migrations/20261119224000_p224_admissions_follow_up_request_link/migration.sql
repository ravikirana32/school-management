ALTER TABLE "AdmissionReviewNote" ADD COLUMN "followUpToId" VARCHAR(128);
CREATE INDEX "AdmissionReviewNote_org_school_application_followUpToId_idx" ON "AdmissionReviewNote"("organizationId", "schoolId", "applicationId", "followUpToId");
