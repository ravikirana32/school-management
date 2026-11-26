ALTER TABLE "AdmissionApplicationDocument" ADD COLUMN "securityStatus" "DocumentSecurityStatus" NOT NULL DEFAULT 'PENDING_UPLOAD';
ALTER TABLE "AdmissionApplicationDocument" ADD COLUMN "scanRequestedAt" TIMESTAMP(3);
CREATE INDEX "AdmissionApplicationDocument_org_school_security_created_idx" ON "AdmissionApplicationDocument"("organizationId", "schoolId", "securityStatus", "createdAt");
CREATE POLICY "AdmissionApplicationDocument_scan_worker_select" ON "AdmissionApplicationDocument"
  FOR SELECT USING (current_setting('app.document_scan_worker', true) = 'true');
CREATE POLICY "AdmissionApplicationDocument_scan_worker_update" ON "AdmissionApplicationDocument"
  FOR UPDATE USING (current_setting('app.document_scan_worker', true) = 'true')
  WITH CHECK (current_setting('app.document_scan_worker', true) = 'true');
CREATE POLICY "AdmissionApplicationDocument_scan_callback_select" ON "AdmissionApplicationDocument"
  FOR SELECT USING ("id" = current_setting('app.document_scan_id', true)
    AND "objectKey" = current_setting('app.document_scan_object_key', true));
