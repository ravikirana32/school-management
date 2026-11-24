-- P38: schema versions, explicit approval history and private PDF artifact metadata.
ALTER TABLE "StudentReportCard"
  ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "schemaVersionId" TEXT,
  ADD COLUMN IF NOT EXISTS "gradeLevelId" TEXT;
CREATE TABLE IF NOT EXISTS "ReportCardSchemaVersion" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL, "gradeLevelId" TEXT NOT NULL, "boardKey" TEXT NOT NULL,
  "code" VARCHAR(60) NOT NULL, "version" INTEGER NOT NULL CHECK ("version" > 0),
  "status" TEXT NOT NULL DEFAULT 'DRAFT' CHECK ("status" IN ('DRAFT','ACTIVE','RETIRED')),
  "schemaDefinition" JSONB NOT NULL, "effectiveFrom" DATE, "effectiveTo" DATE,
  "createdBy" TEXT NOT NULL, "approvedBy" TEXT, "approvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "ReportCardSchemaVersion_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "ReportCardSchemaVersion_school_code_version_key" UNIQUE ("schoolId","code","version"),
  CONSTRAINT "ReportCardSchemaVersion_school_fk" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "ReportCardSchemaVersion_year_fk" FOREIGN KEY ("academicYearId","organizationId","schoolId") REFERENCES "AcademicYear"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "ReportCardSchemaVersion_grade_fk" FOREIGN KEY ("gradeLevelId","organizationId","schoolId") REFERENCES "GradeLevel"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CHECK ("effectiveTo" IS NULL OR "effectiveFrom" IS NULL OR "effectiveTo" >= "effectiveFrom")
);
CREATE INDEX IF NOT EXISTS "ReportCardSchemaVersion_scope_status_idx" ON "ReportCardSchemaVersion"("organizationId","schoolId","academicYearId","gradeLevelId","status");
ALTER TABLE "StudentReportCard" ADD CONSTRAINT "StudentReportCard_approval_status_check" CHECK ("approvalStatus" IN ('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED'));
ALTER TABLE "StudentReportCard" ADD CONSTRAINT "StudentReportCard_schema_scope_fk" FOREIGN KEY ("schemaVersionId","organizationId","schoolId") REFERENCES "ReportCardSchemaVersion"("id","organizationId","schoolId") ON DELETE RESTRICT;
CREATE TABLE IF NOT EXISTS "ReportCardApprovalEvent" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "reportCardId" TEXT NOT NULL, "actorUserId" TEXT NOT NULL, "action" VARCHAR(40) NOT NULL,
  "reason" VARCHAR(1000), "metadata" JSONB, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "ReportCardApprovalEvent_id_org_school_key" UNIQUE("id","organizationId","schoolId"),
  CONSTRAINT "ReportCardApprovalEvent_report_fk" FOREIGN KEY("reportCardId","organizationId","schoolId") REFERENCES "StudentReportCard"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "ReportCardApprovalEvent_school_fk" FOREIGN KEY("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "ReportCardApprovalEvent_scope_report_created_idx" ON "ReportCardApprovalEvent"("organizationId","schoolId","reportCardId","createdAt");
CREATE TABLE IF NOT EXISTS "ReportCardPdfArtifact" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "reportCardId" TEXT NOT NULL, "objectKey" TEXT NOT NULL UNIQUE,
  "mimeType" TEXT NOT NULL DEFAULT 'application/pdf', "sizeBytes" BIGINT NOT NULL CHECK("sizeBytes">0),
  "sha256" VARCHAR(64) NOT NULL, "generatedBy" TEXT NOT NULL, "generatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "ReportCardPdfArtifact_id_org_school_key" UNIQUE("id","organizationId","schoolId"),
  CONSTRAINT "ReportCardPdfArtifact_report_fk" FOREIGN KEY("reportCardId","organizationId","schoolId") REFERENCES "StudentReportCard"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "ReportCardPdfArtifact_school_fk" FOREIGN KEY("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "ReportCardPdfArtifact_reportCardId_key" ON "ReportCardPdfArtifact"("reportCardId");
CREATE INDEX IF NOT EXISTS "ReportCardPdfArtifact_scope_report_generated_idx" ON "ReportCardPdfArtifact"("organizationId","schoolId","reportCardId","generatedAt");
DO $$ DECLARE t TEXT; BEGIN
 FOREACH t IN ARRAY ARRAY['ReportCardSchemaVersion','ReportCardApprovalEvent','ReportCardPdfArtifact'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true))',t||'_tenant_policy',t);
 END LOOP;
END $$;
-- Prevent concurrent activation of more than one schema for the same school/year/grade/board.
CREATE UNIQUE INDEX IF NOT EXISTS "ReportCardSchemaVersion_one_active_idx"
 ON "ReportCardSchemaVersion"("organizationId","schoolId","academicYearId","gradeLevelId","boardKey") WHERE "status"='ACTIVE';

-- Approval events are append-only, including for privileged application roles.
CREATE OR REPLACE FUNCTION "prevent_report_card_approval_event_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'ReportCardApprovalEvent is append-only';
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS "ReportCardApprovalEvent_immutable_trigger" ON "ReportCardApprovalEvent";
CREATE TRIGGER "ReportCardApprovalEvent_immutable_trigger"
 BEFORE UPDATE OR DELETE ON "ReportCardApprovalEvent"
 FOR EACH ROW EXECUTE FUNCTION "prevent_report_card_approval_event_mutation"();
