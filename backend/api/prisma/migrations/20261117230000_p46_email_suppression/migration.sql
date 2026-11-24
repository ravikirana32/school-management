-- P46 tenant-local email suppression. Store keyed hashes only; never store cleartext email.
CREATE TABLE "NotificationEmailSuppression" (
 "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "emailHash" VARCHAR(64) NOT NULL, "reason" VARCHAR(30) NOT NULL CHECK ("reason" IN ('BOUNCE','COMPLAINT','MANUAL','PROVIDER_POLICY')),
 "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE','RELEASED')),
 "sourceEventId" VARCHAR(200), "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
 "releasedBy" TEXT, "releasedAt" TIMESTAMP(3), "releaseReason" VARCHAR(500),
 CONSTRAINT "NotificationEmailSuppression_id_org_school_key" UNIQUE("id","organizationId","schoolId"),
 CONSTRAINT "NotificationEmailSuppression_school_fk" FOREIGN KEY("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE
);
CREATE INDEX "NotificationEmailSuppression_lookup_idx" ON "NotificationEmailSuppression"("organizationId","schoolId","emailHash","status");
CREATE INDEX "NotificationEmailSuppression_created_idx" ON "NotificationEmailSuppression"("organizationId","schoolId","createdAt" DESC);
CREATE UNIQUE INDEX "NotificationEmailSuppression_active_email_key" ON "NotificationEmailSuppression"("organizationId","schoolId","emailHash") WHERE "status"='ACTIVE';
CREATE TABLE "NotificationEmailSuppressionAudit" (
 "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "suppressionId" TEXT NOT NULL,
 "actorUserId" TEXT, "action" VARCHAR(20) NOT NULL CHECK ("action" IN ('CREATED','RELEASED')), "reason" VARCHAR(500), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
 CONSTRAINT "NotificationEmailSuppressionAudit_suppression_fk" FOREIGN KEY("suppressionId","organizationId","schoolId") REFERENCES "NotificationEmailSuppression"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE INDEX "NotificationEmailSuppressionAudit_history_idx" ON "NotificationEmailSuppressionAudit"("organizationId","schoolId","suppressionId","createdAt");
DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['NotificationEmailSuppression','NotificationEmailSuppressionAudit'] LOOP
 EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t); EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY %I ON %I USING ("organizationId"=current_setting(''app.current_organization_id'',true) AND "schoolId"=current_setting(''app.current_school_id'',true)) WITH CHECK ("organizationId"=current_setting(''app.current_organization_id'',true) AND "schoolId"=current_setting(''app.current_school_id'',true))',t||'_tenant_policy',t); END LOOP; END $$;
CREATE POLICY "NotificationEmailSuppression_worker_policy" ON "NotificationEmailSuppression" FOR SELECT USING (current_setting('app.notification_worker',true)='true');
