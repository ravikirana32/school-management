-- P40: transactional notification batches/outbox/preferences; IN_APP inbox writes are committed atomically.
CREATE TABLE "NotificationBatch" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "category" VARCHAR(40) NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "createdBy" TEXT NOT NULL,
  "recipientCount" INTEGER NOT NULL DEFAULT 0 CHECK ("recipientCount" >= 0),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "NotificationBatch_id_org_school_key" UNIQUE("id","organizationId","schoolId"),
  CONSTRAINT "NotificationBatch_school_fk" FOREIGN KEY("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE
);
CREATE INDEX "NotificationBatch_scope_created_idx" ON "NotificationBatch"("organizationId","schoolId","createdAt" DESC);
CREATE TABLE "NotificationOutbox" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "recipientUserId" TEXT NOT NULL,
  "studentId" TEXT,
  "category" VARCHAR(40) NOT NULL,
  "channel" VARCHAR(20) NOT NULL CHECK("channel" IN ('IN_APP','EMAIL','PUSH')),
  "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK("status" IN ('PENDING','PROCESSING','DELIVERED','RETRY','DEAD_LETTER','CANCELLED')),
  "payload" JSONB NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0 CHECK("attempts">=0),
  "lastError" VARCHAR(1000),
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "NotificationOutbox_id_org_school_key" UNIQUE("id","organizationId","schoolId"),
  CONSTRAINT "NotificationOutbox_batch_user_channel_key" UNIQUE("batchId","recipientUserId","channel"),
  CONSTRAINT "NotificationOutbox_batch_fk" FOREIGN KEY("batchId","organizationId","schoolId") REFERENCES "NotificationBatch"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "NotificationOutbox_school_fk" FOREIGN KEY("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "NotificationOutbox_student_fk" FOREIGN KEY("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "NotificationOutbox_recipient_fk" FOREIGN KEY("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "NotificationOutbox_scope_status_created_idx" ON "NotificationOutbox"("organizationId","schoolId","status","createdAt");
CREATE INDEX "NotificationOutbox_recipient_status_created_idx" ON "NotificationOutbox"("recipientUserId","status","createdAt");
CREATE TABLE "NotificationPreference" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "category" VARCHAR(40) NOT NULL,
  "channel" VARCHAR(20) NOT NULL CHECK("channel" IN ('IN_APP','EMAIL','PUSH')),
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "NotificationPreference_id_org_school_key" UNIQUE("id","organizationId","schoolId"),
  CONSTRAINT "NotificationPreference_scope_user_category_channel_key" UNIQUE("organizationId","schoolId","userId","category","channel"),
  CONSTRAINT "NotificationPreference_school_fk" FOREIGN KEY("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "NotificationPreference_user_fk" FOREIGN KEY("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "NotificationPreference_scope_user_idx" ON "NotificationPreference"("organizationId","schoolId","userId");
DO $$ DECLARE t TEXT; BEGIN
 FOREACH t IN ARRAY ARRAY['NotificationBatch','NotificationOutbox','NotificationPreference'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true))',t||'_tenant_policy',t);
 END LOOP;
END $$;
