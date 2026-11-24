CREATE TABLE "AdmissionApplicantNotification" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "eventType" VARCHAR(40) NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "body" VARCHAR(1000) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3),
  CONSTRAINT "AdmissionApplicantNotification_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdmissionApplicantNotification_eventKey_key" ON "AdmissionApplicantNotification"("eventKey");
CREATE INDEX "AdmissionApplicantNotification_org_school_app_created_idx" ON "AdmissionApplicantNotification"("organizationId", "schoolId", "applicationId", "createdAt");
CREATE INDEX "AdmissionApplicantNotification_org_school_app_read_idx" ON "AdmissionApplicantNotification"("organizationId", "schoolId", "applicationId", "readAt");
