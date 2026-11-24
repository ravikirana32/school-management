-- P133: tenant-safe cross-batch historical allocations and auditable exception resolution.
CREATE TABLE "AccountingHistoricalAllocation" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "sourceRowId" TEXT NOT NULL,
  "targetRowId" TEXT NOT NULL,
  "allocationType" VARCHAR(24) NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountingHistoricalAllocation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AccountingHistoricalAllocation_amount_ck" CHECK ("amount" > 0),
  CONSTRAINT "AccountingHistoricalAllocation_type_ck" CHECK ("allocationType" IN ('PAYMENT_TO_CHARGE','REFUND_TO_PAYMENT')),
  CONSTRAINT "AccountingHistoricalAllocation_tenant_fk" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AccountingHistoricalAllocation_source_fk" FOREIGN KEY ("sourceRowId","organizationId","schoolId") REFERENCES "AccountingHistoricalImportRow"("id","organizationId","schoolId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AccountingHistoricalAllocation_target_fk" FOREIGN KEY ("targetRowId","organizationId","schoolId") REFERENCES "AccountingHistoricalImportRow"("id","organizationId","schoolId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AccountingHistoricalAllocation_source_target_ck" CHECK ("sourceRowId" <> "targetRowId"),
  CONSTRAINT "AccountingHistoricalAllocation_source_target_type_uq" UNIQUE ("sourceRowId","targetRowId","allocationType"),
  CONSTRAINT "AccountingHistoricalAllocation_id_tenant_uq" UNIQUE ("id","organizationId","schoolId")
);
CREATE INDEX "AccountingHistoricalAllocation_source_idx" ON "AccountingHistoricalAllocation"("organizationId","schoolId","sourceRowId");
CREATE INDEX "AccountingHistoricalAllocation_target_idx" ON "AccountingHistoricalAllocation"("organizationId","schoolId","targetRowId");
CREATE FUNCTION validate_historical_allocation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE st TEXT; tt TEXT; ss TEXT; ts TEXT; sc TEXT; tc TEXT; sd DATE; td DATE; sa NUMERIC; ta NUMERIC; sstatus TEXT; tstatus TEXT; source_used NUMERIC; target_used NUMERIC;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW."organizationId"||':'||NEW."schoolId"||':historical-allocation-row:'||LEAST(NEW."sourceRowId",NEW."targetRowId"),0));
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW."organizationId"||':'||NEW."schoolId"||':historical-allocation-row:'||GREATEST(NEW."sourceRowId",NEW."targetRowId"),0));
 SELECT r."sourceType",r."studentId",b."currency",r."originalTransactionDate",r."amount",b."status" INTO st,ss,sc,sd,sa,sstatus FROM "AccountingHistoricalImportRow" r JOIN "AccountingHistoricalImportBatch" b ON b."id"=r."batchId" AND b."organizationId"=r."organizationId" AND b."schoolId"=r."schoolId" WHERE r."id"=NEW."sourceRowId" AND r."organizationId"=NEW."organizationId" AND r."schoolId"=NEW."schoolId";
 SELECT r."sourceType",r."studentId",b."currency",r."originalTransactionDate",r."amount",b."status" INTO tt,ts,tc,td,ta,tstatus FROM "AccountingHistoricalImportRow" r JOIN "AccountingHistoricalImportBatch" b ON b."id"=r."batchId" AND b."organizationId"=r."organizationId" AND b."schoolId"=r."schoolId" WHERE r."id"=NEW."targetRowId" AND r."organizationId"=NEW."organizationId" AND r."schoolId"=NEW."schoolId";
 IF st IS NULL OR tt IS NULL OR sstatus <> 'POSTED' OR tstatus <> 'POSTED' OR ss IS DISTINCT FROM ts OR sc IS DISTINCT FROM tc OR sd < td THEN RAISE EXCEPTION 'Historical allocation requires posted same-student/same-currency rows in date order'; END IF;
 IF (NEW."allocationType"='PAYMENT_TO_CHARGE' AND (st <> 'PAYMENT' OR tt <> 'CHARGE')) OR (NEW."allocationType"='REFUND_TO_PAYMENT' AND (st <> 'REFUND' OR tt <> 'PAYMENT')) THEN RAISE EXCEPTION 'Historical allocation source/target types do not match allocation type'; END IF;
 SELECT COALESCE(SUM("amount"),0) INTO source_used FROM "AccountingHistoricalAllocation" WHERE "organizationId"=NEW."organizationId" AND "schoolId"=NEW."schoolId" AND "sourceRowId"=NEW."sourceRowId" AND "allocationType"=NEW."allocationType";
 SELECT COALESCE(SUM("amount"),0) INTO target_used FROM "AccountingHistoricalAllocation" WHERE "organizationId"=NEW."organizationId" AND "schoolId"=NEW."schoolId" AND "targetRowId"=NEW."targetRowId" AND "allocationType"=NEW."allocationType";
 IF source_used + NEW."amount" > sa OR target_used + NEW."amount" > ta THEN RAISE EXCEPTION 'Historical allocation would over-allocate source or target'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER "AccountingHistoricalAllocation_validate" BEFORE INSERT ON "AccountingHistoricalAllocation" FOR EACH ROW EXECUTE FUNCTION validate_historical_allocation();

CREATE TABLE "AccountingHistoricalException" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "historicalRowId" TEXT NOT NULL,
  "exceptionType" VARCHAR(40) NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'OPEN',
  "details" VARCHAR(1000) NOT NULL,
  "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "resolutionNote" VARCHAR(1000),
  CONSTRAINT "AccountingHistoricalException_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AccountingHistoricalException_status_ck" CHECK ("status" IN ('OPEN','RESOLVED')),
  CONSTRAINT "AccountingHistoricalException_resolution_ck" CHECK (("status"='OPEN' AND "resolvedBy" IS NULL AND "resolvedAt" IS NULL AND "resolutionNote" IS NULL) OR ("status"='RESOLVED' AND "resolvedBy" IS NOT NULL AND "resolvedAt" IS NOT NULL AND length(trim("resolutionNote")) >= 10)),
  CONSTRAINT "AccountingHistoricalException_row_fk" FOREIGN KEY ("historicalRowId","organizationId","schoolId") REFERENCES "AccountingHistoricalImportRow"("id","organizationId","schoolId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AccountingHistoricalException_row_type_uq" UNIQUE ("historicalRowId","exceptionType"),
  CONSTRAINT "AccountingHistoricalException_id_tenant_uq" UNIQUE ("id","organizationId","schoolId")
);
CREATE INDEX "AccountingHistoricalException_tenant_status_idx" ON "AccountingHistoricalException"("organizationId","schoolId","status","detectedAt");

CREATE TABLE "AccountingHistoricalExceptionEvent" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "exceptionId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "eventType" VARCHAR(24) NOT NULL,
  "note" VARCHAR(1000) NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountingHistoricalExceptionEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AccountingHistoricalExceptionEvent_exception_fk" FOREIGN KEY ("exceptionId","organizationId","schoolId") REFERENCES "AccountingHistoricalException"("id","organizationId","schoolId") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "AccountingHistoricalExceptionEvent_tenant_exception_idx" ON "AccountingHistoricalExceptionEvent"("organizationId","schoolId","exceptionId","createdAt");

DO $$ DECLARE t TEXT; BEGIN
 FOREACH t IN ARRAY ARRAY['AccountingHistoricalAllocation','AccountingHistoricalException','AccountingHistoricalExceptionEvent'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true))',t||'_tenant_policy',t);
 END LOOP;
END $$;

CREATE FUNCTION prevent_historical_allocation_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Historical allocations are append-only'; END $$;
CREATE TRIGGER "AccountingHistoricalAllocation_append_only" BEFORE UPDATE OR DELETE OR TRUNCATE ON "AccountingHistoricalAllocation" FOR EACH STATEMENT EXECUTE FUNCTION prevent_historical_allocation_mutation();
CREATE FUNCTION prevent_historical_exception_event_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Historical exception events are append-only'; END $$;
CREATE TRIGGER "AccountingHistoricalExceptionEvent_append_only" BEFORE UPDATE OR DELETE OR TRUNCATE ON "AccountingHistoricalExceptionEvent" FOR EACH STATEMENT EXECUTE FUNCTION prevent_historical_exception_event_mutation();
CREATE FUNCTION enforce_historical_exception_transition() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF OLD."status" <> 'OPEN' OR NEW."status" <> 'RESOLVED' OR NEW."id" <> OLD."id" OR NEW."historicalRowId" <> OLD."historicalRowId" OR NEW."organizationId" <> OLD."organizationId" OR NEW."schoolId" <> OLD."schoolId" OR NEW."exceptionType" <> OLD."exceptionType" OR NEW."details" <> OLD."details" OR NEW."detectedAt" <> OLD."detectedAt" OR NEW."resolvedBy" IS NULL OR NEW."resolvedAt" IS NULL OR length(trim(COALESCE(NEW."resolutionNote",''))) < 10 THEN RAISE EXCEPTION 'Invalid or repeated historical exception resolution'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER "AccountingHistoricalException_one_way_resolution" BEFORE UPDATE ON "AccountingHistoricalException" FOR EACH ROW EXECUTE FUNCTION enforce_historical_exception_transition();
CREATE FUNCTION prevent_historical_exception_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Historical exceptions cannot be deleted'; END $$;
CREATE TRIGGER "AccountingHistoricalException_no_delete" BEFORE DELETE OR TRUNCATE ON "AccountingHistoricalException" FOR EACH STATEMENT EXECUTE FUNCTION prevent_historical_exception_delete();
