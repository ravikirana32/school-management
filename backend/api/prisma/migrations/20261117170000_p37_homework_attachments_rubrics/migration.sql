-- P37: private homework attachment lifecycle and append-only grading history.
ALTER TABLE "HomeworkSubmission" ADD COLUMN "rubricResults" JSONB;

CREATE TABLE "HomeworkSubmissionAttachment" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "displayName" VARCHAR(150) NOT NULL,
  "objectKey" TEXT NOT NULL UNIQUE,
  "mimeType" VARCHAR(120) NOT NULL,
  "sizeBytes" BIGINT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "securityStatus" "DocumentSecurityStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
  "scanRequestedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HomeworkSubmissionAttachment_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "HomeworkSubmissionAttachment_submission_fk" FOREIGN KEY ("submissionId","organizationId","schoolId") REFERENCES "HomeworkSubmission"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "HomeworkSubmissionAttachment_size_ck" CHECK ("sizeBytes" > 0)
);
CREATE INDEX "HomeworkSubmissionAttachment_submission_status_idx" ON "HomeworkSubmissionAttachment"("organizationId","schoolId","submissionId","securityStatus");
CREATE INDEX "HomeworkSubmissionAttachment_scan_retry_idx" ON "HomeworkSubmissionAttachment"("securityStatus","scanRequestedAt");
ALTER TABLE "HomeworkSubmissionAttachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HomeworkSubmissionAttachment" FORCE ROW LEVEL SECURITY;
CREATE POLICY "HomeworkSubmissionAttachment_tenant_policy" ON "HomeworkSubmissionAttachment"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
CREATE POLICY "HomeworkSubmissionAttachment_scanner_lookup" ON "HomeworkSubmissionAttachment" FOR SELECT
  USING ("id" = current_setting('app.document_scan_id', true)
     AND "objectKey" = current_setting('app.document_scan_object_key', true)
     AND "securityStatus" = 'QUARANTINED');

CREATE TABLE "HomeworkSubmissionGradeEvent" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "eventType" VARCHAR(30) NOT NULL,
  "score" DECIMAL(7,2),
  "maxScore" DECIMAL(7,2),
  "rubricResults" JSONB,
  "feedback" VARCHAR(4000),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HomeworkSubmissionGradeEvent_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "HomeworkSubmissionGradeEvent_submission_fk" FOREIGN KEY ("submissionId","organizationId","schoolId") REFERENCES "HomeworkSubmission"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "HomeworkSubmissionGradeEvent_type_ck" CHECK ("eventType" IN ('GRADED','REOPENED')),
  CONSTRAINT "HomeworkSubmissionGradeEvent_score_ck" CHECK (("score" IS NULL AND "maxScore" IS NULL) OR ("score" >= 0 AND "maxScore" > 0 AND "score" <= "maxScore"))
);
CREATE INDEX "HomeworkSubmissionGradeEvent_submission_created_idx" ON "HomeworkSubmissionGradeEvent"("organizationId","schoolId","submissionId","createdAt");
ALTER TABLE "HomeworkSubmissionGradeEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HomeworkSubmissionGradeEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY "HomeworkSubmissionGradeEvent_tenant_policy" ON "HomeworkSubmissionGradeEvent"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
CREATE POLICY "homework_attachment_scan_worker_read" ON "HomeworkSubmissionAttachment"
  FOR SELECT USING (current_setting('app.document_scan_worker', true) = 'true' AND "securityStatus" = 'QUARANTINED');
CREATE POLICY "homework_attachment_scan_worker_update" ON "HomeworkSubmissionAttachment"
  FOR UPDATE USING (current_setting('app.document_scan_worker', true) = 'true' AND "securityStatus" = 'QUARANTINED')
  WITH CHECK (current_setting('app.document_scan_worker', true) = 'true' AND "securityStatus" = 'QUARANTINED');

-- Grade events are evidence/audit history and must not be rewritten after insertion.
CREATE FUNCTION prevent_homework_grade_event_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Homework grade history is append-only';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "HomeworkSubmissionGradeEvent_immutable"
  BEFORE UPDATE OR DELETE ON "HomeworkSubmissionGradeEvent"
  FOR EACH ROW EXECUTE FUNCTION prevent_homework_grade_event_mutation();
