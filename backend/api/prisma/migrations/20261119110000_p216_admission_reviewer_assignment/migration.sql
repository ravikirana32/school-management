ALTER TABLE "AdmissionApplication" ADD COLUMN "assignedReviewerId" TEXT;
CREATE INDEX "AdmissionApplication_org_school_reviewer_idx" ON "AdmissionApplication"("organizationId", "schoolId", "assignedReviewerId");
