-- P129: approved opening-balance imports; rows preserve student-level source evidence.
CREATE TABLE "AccountingOpeningBalanceBatch" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "batchNumber" VARCHAR(40) NOT NULL, "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
 "asOfDate" DATE NOT NULL, "status" VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
 "sourceDescription" VARCHAR(500) NOT NULL, "sourceDocumentReference" VARCHAR(240),
 "createdBy" TEXT NOT NULL, "approvedBy" TEXT, "approvedAt" TIMESTAMP(3),
 "postedBy" TEXT, "postedAt" TIMESTAMP(3), "journalEntryId" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "AccountingOpeningBalanceBatch_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AccountingOpeningBalanceBatch_status_ck" CHECK ("status" IN ('DRAFT','APPROVED','POSTED')),
 CONSTRAINT "AccountingOpeningBalanceBatch_id_tenant_uq" UNIQUE ("id","organizationId","schoolId"),
 CONSTRAINT "AccountingOpeningBalanceBatch_school_number_uq" UNIQUE ("schoolId","batchNumber"),
 CONSTRAINT "AccountingOpeningBalanceBatch_school_journal_uq" UNIQUE ("schoolId","journalEntryId"),
 CONSTRAINT "AccountingOpeningBalanceBatch_journal_fk" FOREIGN KEY ("journalEntryId","organizationId","schoolId") REFERENCES "AccountingJournalEntry"("id","organizationId","schoolId") ON DELETE RESTRICT
);
CREATE INDEX "AccountingOpeningBalanceBatch_tenant_status_date_idx" ON "AccountingOpeningBalanceBatch"("organizationId","schoolId","status","asOfDate");
CREATE TABLE "AccountingOpeningBalanceRow" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "batchId" TEXT NOT NULL,
 "studentId" TEXT NOT NULL, "sourceReference" VARCHAR(120) NOT NULL, "description" VARCHAR(300),
 "debitAmount" DECIMAL(14,2) NOT NULL DEFAULT 0, "creditAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AccountingOpeningBalanceRow_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AccountingOpeningBalanceRow_amount_ck" CHECK (("debitAmount" > 0 AND "creditAmount" = 0) OR ("creditAmount" > 0 AND "debitAmount" = 0)),
 CONSTRAINT "AccountingOpeningBalanceRow_batch_fk" FOREIGN KEY ("batchId","organizationId","schoolId") REFERENCES "AccountingOpeningBalanceBatch"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingOpeningBalanceRow_student_fk" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingOpeningBalanceRow_id_tenant_uq" UNIQUE ("id","organizationId","schoolId"),
 CONSTRAINT "AccountingOpeningBalanceRow_batch_ref_uq" UNIQUE ("batchId","sourceReference")
);
CREATE INDEX "AccountingOpeningBalanceRow_tenant_student_idx" ON "AccountingOpeningBalanceRow"("organizationId","schoolId","studentId");
DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['AccountingOpeningBalanceBatch','AccountingOpeningBalanceRow'] LOOP
 EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t); EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true))',t||'_tenant_policy',t);
END LOOP; END $$;
-- Only DRAFT batches/rows can be edited or deleted; approval and posting are one-way transitions.
CREATE OR REPLACE FUNCTION guard_opening_balance_mutation() RETURNS trigger AS $$
DECLARE batch_status TEXT; target_batch TEXT;
BEGIN
 target_batch := CASE WHEN TG_OP='DELETE' THEN OLD."batchId" ELSE NEW."batchId" END;
 SELECT "status" INTO batch_status FROM "AccountingOpeningBalanceBatch" WHERE "id"=target_batch;
 IF batch_status IS DISTINCT FROM 'DRAFT' THEN RAISE EXCEPTION 'Approved or posted opening balance imports are immutable'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER "AccountingOpeningBalanceRow_draft_only" BEFORE INSERT OR UPDATE OR DELETE ON "AccountingOpeningBalanceRow" FOR EACH ROW EXECUTE FUNCTION guard_opening_balance_mutation();
CREATE OR REPLACE FUNCTION guard_opening_balance_batch_transition() RETURNS trigger AS $$
BEGIN
 IF TG_OP='DELETE' AND OLD."status" <> 'DRAFT' THEN RAISE EXCEPTION 'Approved or posted opening balance batches cannot be deleted'; END IF;
 IF TG_OP='UPDATE' THEN
   IF OLD."status"='POSTED' THEN RAISE EXCEPTION 'Posted opening balance batches are immutable'; END IF;
   IF OLD."status"='DRAFT' AND NEW."status" NOT IN ('DRAFT','APPROVED') THEN RAISE EXCEPTION 'Invalid opening balance batch transition'; END IF;
   IF OLD."status"='DRAFT' AND NEW."status"='APPROVED' AND (NEW."approvedBy" IS NULL OR NEW."approvedAt" IS NULL OR NEW."approvedBy"=NEW."createdBy") THEN RAISE EXCEPTION 'Opening balance approval must be independent'; END IF;
   IF OLD."status"='APPROVED' AND (NEW."status" <> 'POSTED' OR NEW."journalEntryId" IS NULL OR NEW."postedBy" IS NULL OR NEW."postedAt" IS NULL OR NEW."approvedBy" IS DISTINCT FROM OLD."approvedBy" OR NEW."approvedAt" IS DISTINCT FROM OLD."approvedAt") THEN RAISE EXCEPTION 'Approved opening balance batch can only transition to posted'; END IF;
   IF OLD."status" <> 'DRAFT' AND (NEW."createdBy" <> OLD."createdBy" OR NEW."currency" <> OLD."currency" OR NEW."asOfDate" <> OLD."asOfDate" OR NEW."sourceDescription" <> OLD."sourceDescription" OR NEW."sourceDocumentReference" IS DISTINCT FROM OLD."sourceDocumentReference") THEN RAISE EXCEPTION 'Approved or posted opening balance batch is immutable'; END IF;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER "AccountingOpeningBalanceBatch_transition_guard" BEFORE UPDATE OR DELETE ON "AccountingOpeningBalanceBatch" FOR EACH ROW EXECUTE FUNCTION guard_opening_balance_batch_transition();
