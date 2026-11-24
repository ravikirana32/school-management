BEGIN;
ALTER TABLE "ReportCardTemplateVersion"
  ADD COLUMN "layout" VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN "language" VARCHAR(35) NOT NULL DEFAULT 'en-IN';
ALTER TABLE "ReportCardPdfArtifact"
  ADD COLUMN "accessibilityTagged" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "accessibilityProfile" VARCHAR(24) NOT NULL DEFAULT 'UNTAGGED',
  ADD COLUMN "documentLanguage" VARCHAR(35) NOT NULL DEFAULT 'en-IN';
ALTER TABLE "ReportCardTemplateVersion"
  ADD CONSTRAINT "ReportCardTemplateVersion_layout_check"
  CHECK ("layout" IN ('STANDARD','COMPACT','LARGE_PRINT'));
COMMIT;
