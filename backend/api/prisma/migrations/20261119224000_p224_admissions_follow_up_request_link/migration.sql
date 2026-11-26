ALTER TABLE "AdmissionReviewNote" ADD COLUMN IF NOT EXISTS "followUpToId" VARCHAR(128);
CREATE INDEX IF NOT EXISTS "AdmissionReviewNote_org_school_application_followUpToId_idx" ON "AdmissionReviewNote"("organizationId", "schoolId", "applicationId", "followUpToId");
