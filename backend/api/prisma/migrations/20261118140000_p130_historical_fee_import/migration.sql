-- P130 staged historical fee transactions. No legacy source data is fabricated.
CREATE TABLE "AccountingHistoricalImportBatch" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "batchNumber" VARCHAR(40) NOT NULL, "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
 "sourceDescription" VARCHAR(500) NOT NULL, "sourceDocumentReference" VARCHAR(240),
 "status" VARCHAR(16) NOT NULL DEFAULT 'DRAFT', "createdBy" TEXT NOT NULL,
 "approvedBy" TEXT, "approvedAt" TIMESTAMP(3), "approvalNote" VARCHAR(1000),
 "postedBy" TEXT, "postedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "AccountingHistoricalImportBatch_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AccountingHistoricalImportBatch_status_ck" CHECK ("status" IN ('DRAFT','APPROVED','POSTED')),
 CONSTRAINT "AccountingHistoricalImportBatch_id_tenant_uq" UNIQUE ("id","organizationId","schoolId"),
 CONSTRAINT "AccountingHistoricalImportBatch_school_number_uq" UNIQUE ("schoolId","batchNumber")
);
CREATE INDEX "AccountingHistoricalImportBatch_tenant_status_idx" ON "AccountingHistoricalImportBatch"("organizationId","schoolId","status","createdAt");
CREATE TABLE "AccountingHistoricalImportRow" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "batchId" TEXT NOT NULL,
 "studentId" TEXT NOT NULL, "sourceType" VARCHAR(16) NOT NULL, "sourceReference" VARCHAR(120) NOT NULL,
 "originalTransactionDate" DATE NOT NULL, "amount" DECIMAL(14,2) NOT NULL, "method" VARCHAR(40),
 "externalSettlementReference" VARCHAR(120), "description" VARCHAR(300), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AccountingHistoricalImportRow_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AccountingHistoricalImportRow_type_ck" CHECK ("sourceType" IN ('CHARGE','PAYMENT','REFUND')),
 CONSTRAINT "AccountingHistoricalImportRow_amount_ck" CHECK ("amount" > 0),
 CONSTRAINT "AccountingHistoricalImportRow_refund_evidence_ck" CHECK ("sourceType" <> 'REFUND' OR NULLIF(BTRIM("externalSettlementReference"),'') IS NOT NULL),
 CONSTRAINT "AccountingHistoricalImportRow_batch_fk" FOREIGN KEY ("batchId","organizationId","schoolId") REFERENCES "AccountingHistoricalImportBatch"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingHistoricalImportRow_student_fk" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingHistoricalImportRow_id_tenant_uq" UNIQUE ("id","organizationId","schoolId"),
 CONSTRAINT "AccountingHistoricalImportRow_source_uq" UNIQUE ("schoolId","sourceType","sourceReference")
);
CREATE INDEX "AccountingHistoricalImportRow_tenant_student_date_idx" ON "AccountingHistoricalImportRow"("organizationId","schoolId","studentId","originalTransactionDate");
DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['AccountingHistoricalImportBatch','AccountingHistoricalImportRow'] LOOP
 EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t); EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true))',t||'_tenant_policy',t);
END LOOP; END $$;
CREATE OR REPLACE FUNCTION guard_historical_import_row() RETURNS trigger AS $$ DECLARE target_batch TEXT; batch_status TEXT; BEGIN
 target_batch := CASE WHEN TG_OP='DELETE' THEN OLD."batchId" ELSE NEW."batchId" END;
 SELECT "status" INTO batch_status FROM "AccountingHistoricalImportBatch" WHERE "id"=target_batch;
 IF batch_status IS DISTINCT FROM 'DRAFT' THEN RAISE EXCEPTION 'Approved historical import rows are immutable'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER "AccountingHistoricalImportRow_draft_only" BEFORE INSERT OR UPDATE OR DELETE ON "AccountingHistoricalImportRow" FOR EACH ROW EXECUTE FUNCTION guard_historical_import_row();
CREATE OR REPLACE FUNCTION guard_historical_import_batch() RETURNS trigger AS $$ DECLARE row_count BIGINT; BEGIN
 IF TG_OP='DELETE' AND OLD."status" <> 'DRAFT' THEN RAISE EXCEPTION 'Approved historical imports cannot be deleted'; END IF;
 IF TG_OP='UPDATE' THEN
  IF OLD."status"='POSTED' THEN RAISE EXCEPTION 'Posted historical imports are immutable'; END IF;
  IF OLD."status"='DRAFT' AND NEW."status" NOT IN ('DRAFT','APPROVED') THEN RAISE EXCEPTION 'Invalid historical import transition'; END IF;
  IF OLD."status"='DRAFT' AND NEW."status"='APPROVED' THEN SELECT COUNT(*) INTO row_count FROM "AccountingHistoricalImportRow" WHERE "batchId"=OLD."id"; IF row_count=0 OR NEW."approvedBy" IS NULL OR NEW."approvedAt" IS NULL OR NEW."approvedBy"=OLD."createdBy" OR NULLIF(BTRIM(NEW."approvalNote"),'') IS NULL THEN RAISE EXCEPTION 'Non-empty import requires independent approval and note'; END IF; END IF;
  IF OLD."status"='APPROVED' AND (NEW."status" <> 'POSTED' OR NEW."postedBy" IS NULL OR NEW."postedAt" IS NULL OR NEW."approvedBy" IS DISTINCT FROM OLD."approvedBy" OR NEW."approvedAt" IS DISTINCT FROM OLD."approvedAt" OR NEW."approvalNote" IS DISTINCT FROM OLD."approvalNote" OR NEW."createdBy" IS DISTINCT FROM OLD."createdBy" OR NEW."organizationId" IS DISTINCT FROM OLD."organizationId" OR NEW."schoolId" IS DISTINCT FROM OLD."schoolId") THEN RAISE EXCEPTION 'Approved import can only transition to posted without altering approval evidence'; END IF;
  IF OLD."status" <> 'DRAFT' AND (NEW."batchNumber" <> OLD."batchNumber" OR NEW."currency" <> OLD."currency" OR NEW."sourceDescription" <> OLD."sourceDescription" OR NEW."sourceDocumentReference" IS DISTINCT FROM OLD."sourceDocumentReference") THEN RAISE EXCEPTION 'Approved historical import metadata is immutable'; END IF;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER "AccountingHistoricalImportBatch_transition_guard" BEFORE UPDATE OR DELETE ON "AccountingHistoricalImportBatch" FOR EACH ROW EXECUTE FUNCTION guard_historical_import_batch();
