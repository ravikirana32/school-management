-- P43: private quarantined school-brand assets, named report-card templates and atomic outbox leases.
ALTER TABLE "NotificationOutbox" ADD COLUMN "leaseOwner" VARCHAR(80);
ALTER TABLE "NotificationOutbox" ADD COLUMN "leaseUntil" TIMESTAMP(3);
UPDATE "NotificationOutbox" SET "leaseUntil" = "updatedAt" WHERE "status" = 'PROCESSING';
CREATE INDEX "NotificationOutbox_lease_reconcile_idx" ON "NotificationOutbox"("channel", "status", "leaseUntil", "createdAt");

CREATE TABLE "SchoolBrandAsset" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "objectKey" TEXT NOT NULL UNIQUE,
  "mimeType" VARCHAR(80) NOT NULL,
  "sizeBytes" BIGINT NOT NULL CHECK ("sizeBytes" BETWEEN 1 AND 5242880),
  "securityStatus" VARCHAR(24) NOT NULL DEFAULT 'PENDING_UPLOAD' CHECK ("securityStatus" IN ('PENDING_UPLOAD','QUARANTINED','CLEAN','REJECTED')),
  "scanRequestedAt" TIMESTAMP(3),
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "SchoolBrandAsset_id_org_school_key" UNIQUE("id","organizationId","schoolId"),
  CONSTRAINT "SchoolBrandAsset_school_fk" FOREIGN KEY("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "SchoolBrandAsset_uploader_fk" FOREIGN KEY("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT
);
CREATE INDEX "SchoolBrandAsset_scope_status_created_idx" ON "SchoolBrandAsset"("organizationId","schoolId","securityStatus","createdAt");
ALTER TABLE "SchoolBrandAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolBrandAsset" FORCE ROW LEVEL SECURITY;
CREATE POLICY "SchoolBrandAsset_tenant_policy" ON "SchoolBrandAsset"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
CREATE POLICY "SchoolBrandAsset_scan_callback_policy" ON "SchoolBrandAsset"
  FOR SELECT USING (current_setting('app.document_scan_id', true) = "id" AND current_setting('app.document_scan_object_key', true) = "objectKey");
CREATE POLICY "SchoolBrandAsset_scan_worker_policy" ON "SchoolBrandAsset"
  FOR SELECT USING (current_setting('app.document_scan_worker', true) = 'true');
CREATE POLICY "SchoolBrandAsset_scan_worker_update_policy" ON "SchoolBrandAsset"
  FOR UPDATE USING (current_setting('app.document_scan_worker', true) = 'true') WITH CHECK (current_setting('app.document_scan_worker', true) = 'true');

CREATE TABLE "ReportCardTemplateVersion" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "templateKey" VARCHAR(60) NOT NULL,
  "version" INTEGER NOT NULL CHECK ("version" > 0),
  "displayName" VARCHAR(120) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK ("status" IN ('DRAFT','ACTIVE','RETIRED')),
  "brandColor" VARCHAR(7) NOT NULL CHECK ("brandColor" ~ '^#[0-9A-Fa-f]{6}$'),
  "footerText" VARCHAR(180),
  "signatureLabel" VARCHAR(100),
  "createdBy" TEXT NOT NULL,
  "activatedBy" TEXT,
  "activatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "ReportCardTemplateVersion_id_org_school_key" UNIQUE("id","organizationId","schoolId"),
  CONSTRAINT "ReportCardTemplateVersion_school_key_version_key" UNIQUE("schoolId","templateKey","version"),
  CONSTRAINT "ReportCardTemplateVersion_school_fk" FOREIGN KEY("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "ReportCardTemplateVersion_creator_fk" FOREIGN KEY("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT
);
CREATE INDEX "ReportCardTemplateVersion_scope_status_key_idx" ON "ReportCardTemplateVersion"("organizationId","schoolId","status","templateKey");
ALTER TABLE "ReportCardTemplateVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReportCardTemplateVersion" FORCE ROW LEVEL SECURITY;
CREATE POLICY "ReportCardTemplateVersion_tenant_policy" ON "ReportCardTemplateVersion"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
CREATE UNIQUE INDEX "ReportCardTemplateVersion_one_active_idx"
  ON "ReportCardTemplateVersion"("organizationId","schoolId","templateKey") WHERE "status" = 'ACTIVE';
CREATE FUNCTION prevent_report_template_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD."status" <> 'DRAFT' AND (
    NEW."templateKey" IS DISTINCT FROM OLD."templateKey" OR
    NEW."version" IS DISTINCT FROM OLD."version" OR
    NEW."displayName" IS DISTINCT FROM OLD."displayName" OR
    NEW."brandColor" IS DISTINCT FROM OLD."brandColor" OR
    NEW."footerText" IS DISTINCT FROM OLD."footerText" OR
    NEW."signatureLabel" IS DISTINCT FROM OLD."signatureLabel"
  ) THEN RAISE EXCEPTION 'Activated report-card template versions are immutable'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "ReportCardTemplateVersion_immutable_content"
  BEFORE UPDATE ON "ReportCardTemplateVersion" FOR EACH ROW EXECUTE FUNCTION prevent_report_template_mutation();
