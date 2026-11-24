-- P127: school-scoped chart of accounts, accounting periods and immutable double-entry journals.
CREATE TABLE "AccountingAccount" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "accountCode" VARCHAR(20) NOT NULL, "name" VARCHAR(120) NOT NULL,
 "accountType" VARCHAR(20) NOT NULL, "normalBalance" VARCHAR(6) NOT NULL,
 "isSystem" BOOLEAN NOT NULL DEFAULT FALSE, "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "AccountingAccount_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AccountingAccount_type_ck" CHECK ("accountType" IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')),
 CONSTRAINT "AccountingAccount_normal_balance_ck" CHECK ("normalBalance" IN ('DEBIT','CREDIT')),
 CONSTRAINT "AccountingAccount_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
 CONSTRAINT "AccountingAccount_school_code_uq" UNIQUE ("schoolId","accountCode")
);
CREATE INDEX "AccountingAccount_tenant_type_active_idx" ON "AccountingAccount"("organizationId","schoolId","accountType","isActive");

CREATE TABLE "AccountingPeriod" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "periodKey" VARCHAR(7) NOT NULL, "startsOn" DATE NOT NULL, "endsOn" DATE NOT NULL,
 "status" VARCHAR(12) NOT NULL DEFAULT 'OPEN', "closedAt" TIMESTAMP(3), "closedBy" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "AccountingPeriod_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AccountingPeriod_status_ck" CHECK ("status" IN ('OPEN','CLOSED')),
 CONSTRAINT "AccountingPeriod_dates_ck" CHECK ("startsOn" <= "endsOn"),
 CONSTRAINT "AccountingPeriod_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
 CONSTRAINT "AccountingPeriod_school_key_uq" UNIQUE ("schoolId","periodKey")
);
CREATE INDEX "AccountingPeriod_tenant_status_start_idx" ON "AccountingPeriod"("organizationId","schoolId","status","startsOn");

CREATE TABLE "AccountingJournalEntry" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "periodId" TEXT NOT NULL,
 "entryNumber" VARCHAR(40) NOT NULL, "sourceType" VARCHAR(40) NOT NULL, "sourceId" VARCHAR(120) NOT NULL,
 "postingDate" DATE NOT NULL, "currency" VARCHAR(3) NOT NULL DEFAULT 'INR', "description" VARCHAR(500) NOT NULL,
 "status" VARCHAR(12) NOT NULL DEFAULT 'POSTED', "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AccountingJournalEntry_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AccountingJournalEntry_status_ck" CHECK ("status" = 'POSTED'),
 CONSTRAINT "AccountingJournalEntry_period_fk" FOREIGN KEY ("periodId","organizationId","schoolId") REFERENCES "AccountingPeriod"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingJournalEntry_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
 CONSTRAINT "AccountingJournalEntry_school_number_uq" UNIQUE ("schoolId","entryNumber"),
 CONSTRAINT "AccountingJournalEntry_source_uq" UNIQUE ("schoolId","sourceType","sourceId")
);
CREATE INDEX "AccountingJournalEntry_tenant_date_idx" ON "AccountingJournalEntry"("organizationId","schoolId","postingDate","createdAt");
CREATE INDEX "AccountingJournalEntry_tenant_period_status_idx" ON "AccountingJournalEntry"("organizationId","schoolId","periodId","status");

CREATE TABLE "AccountingJournalLine" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "entryId" TEXT NOT NULL,
 "accountId" TEXT NOT NULL, "lineNumber" INTEGER NOT NULL, "debit" DECIMAL(14,2) NOT NULL DEFAULT 0,
 "credit" DECIMAL(14,2) NOT NULL DEFAULT 0, "memo" VARCHAR(300), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AccountingJournalLine_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AccountingJournalLine_entry_fk" FOREIGN KEY ("entryId","organizationId","schoolId") REFERENCES "AccountingJournalEntry"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingJournalLine_account_fk" FOREIGN KEY ("accountId","organizationId","schoolId") REFERENCES "AccountingAccount"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "AccountingJournalLine_side_ck" CHECK (("debit" > 0 AND "credit" = 0) OR ("credit" > 0 AND "debit" = 0)),
 CONSTRAINT "AccountingJournalLine_entry_line_uq" UNIQUE ("entryId","lineNumber")
);
CREATE INDEX "AccountingJournalLine_tenant_account_created_idx" ON "AccountingJournalLine"("organizationId","schoolId","accountId","createdAt");

DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['AccountingAccount','AccountingPeriod','AccountingJournalEntry','AccountingJournalLine'] LOOP
 EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true))',t||'_tenant_policy',t);
END LOOP; END $$;

-- Journal entries and lines are immutable. Corrections must use a new reversal journal.
CREATE OR REPLACE FUNCTION prevent_accounting_journal_mutation() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'Accounting journal history is append-only; post a reversal instead'; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER "AccountingJournalEntry_immutable" BEFORE UPDATE OR DELETE ON "AccountingJournalEntry" FOR EACH ROW EXECUTE FUNCTION prevent_accounting_journal_mutation();
CREATE TRIGGER "AccountingJournalEntry_no_truncate" BEFORE TRUNCATE ON "AccountingJournalEntry" FOR EACH STATEMENT EXECUTE FUNCTION prevent_accounting_journal_mutation();
CREATE TRIGGER "AccountingJournalLine_immutable" BEFORE UPDATE OR DELETE ON "AccountingJournalLine" FOR EACH ROW EXECUTE FUNCTION prevent_accounting_journal_mutation();
CREATE TRIGGER "AccountingJournalLine_no_truncate" BEFORE TRUNCATE ON "AccountingJournalLine" FOR EACH STATEMENT EXECUTE FUNCTION prevent_accounting_journal_mutation();

-- Deferred validation sees the complete journal after all lines have been inserted.
CREATE OR REPLACE FUNCTION assert_accounting_journal_balanced() RETURNS trigger AS $$
DECLARE target_id TEXT; line_count BIGINT; debit_total NUMERIC(16,2); credit_total NUMERIC(16,2);
BEGIN
 target_id := COALESCE(NEW."entryId", OLD."entryId");
 SELECT COUNT(*), COALESCE(SUM("debit"),0), COALESCE(SUM("credit"),0) INTO line_count,debit_total,credit_total FROM "AccountingJournalLine" WHERE "entryId"=target_id;
 IF line_count < 2 OR debit_total <= 0 OR debit_total <> credit_total THEN RAISE EXCEPTION 'Accounting journal % is not balanced', target_id; END IF;
 RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE CONSTRAINT TRIGGER "AccountingJournalLine_balanced_deferred" AFTER INSERT OR UPDATE OR DELETE ON "AccountingJournalLine" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_accounting_journal_balanced();

CREATE OR REPLACE FUNCTION assert_accounting_period_open() RETURNS trigger AS $$
DECLARE period_status TEXT; period_start DATE; period_end DATE;
BEGIN
 SELECT "status","startsOn","endsOn" INTO period_status,period_start,period_end FROM "AccountingPeriod"
 WHERE "id"=NEW."periodId" AND "organizationId"=NEW."organizationId" AND "schoolId"=NEW."schoolId";
 IF period_status IS DISTINCT FROM 'OPEN' OR NEW."postingDate" < period_start OR NEW."postingDate" > period_end THEN
   RAISE EXCEPTION 'Accounting period is closed or does not contain the posting date';
 END IF;
 RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER "AccountingJournalEntry_open_period" BEFORE INSERT ON "AccountingJournalEntry" FOR EACH ROW EXECUTE FUNCTION assert_accounting_period_open();

CREATE OR REPLACE FUNCTION assert_accounting_entry_has_balanced_lines() RETURNS trigger AS $$
DECLARE target_id TEXT; line_count BIGINT; debit_total NUMERIC(16,2); credit_total NUMERIC(16,2);
BEGIN
 target_id := NEW."id";
 SELECT COUNT(*), COALESCE(SUM("debit"),0), COALESCE(SUM("credit"),0) INTO line_count,debit_total,credit_total FROM "AccountingJournalLine" WHERE "entryId"=target_id;
 IF line_count < 2 OR debit_total <= 0 OR debit_total <> credit_total THEN RAISE EXCEPTION 'Accounting journal % must contain balanced lines', target_id; END IF;
 RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE CONSTRAINT TRIGGER "AccountingJournalEntry_balanced_deferred" AFTER INSERT ON "AccountingJournalEntry" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_accounting_entry_has_balanced_lines();
