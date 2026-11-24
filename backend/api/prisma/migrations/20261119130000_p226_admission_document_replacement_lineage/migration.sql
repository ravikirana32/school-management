ALTER TABLE "AdmissionApplicationDocument" ADD COLUMN "replacesDocumentId" TEXT;
CREATE INDEX "AdmissionApplicationDocument_org_school_app_replaces_idx" ON "AdmissionApplicationDocument"("organizationId", "schoolId", "applicationId", "replacesDocumentId");
