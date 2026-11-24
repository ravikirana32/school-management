CREATE TABLE "AdmissionReviewerAssignmentHistory" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "previousReviewerId" TEXT,
  "newReviewerId" TEXT,
  "actorUserId" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdmissionReviewerAssignmentHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdmissionReviewerAssignmentHistory_org_school_application_created_idx" ON "AdmissionReviewerAssignmentHistory"("organizationId", "schoolId", "applicationId", "createdAt");
CREATE INDEX "AdmissionReviewerAssignmentHistory_org_school_newreviewer_created_idx" ON "AdmissionReviewerAssignmentHistory"("organizationId", "schoolId", "newReviewerId", "createdAt");
