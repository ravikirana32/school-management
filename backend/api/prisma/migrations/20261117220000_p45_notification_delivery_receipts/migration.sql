-- P45: canonical provider delivery events with idempotent provider/event identity.
ALTER TABLE "NotificationOutbox" ADD COLUMN "providerMessageId" VARCHAR(200);
ALTER TABLE "NotificationOutbox" ADD COLUMN "lastProviderEventAt" TIMESTAMP(3);
ALTER TABLE "NotificationOutbox" DROP CONSTRAINT IF EXISTS "NotificationOutbox_status_check";
ALTER TABLE "NotificationOutbox" ADD CONSTRAINT "NotificationOutbox_status_check" CHECK ("status" IN ('PENDING','PROCESSING','DELIVERED','RETRY','DEAD_LETTER','CANCELLED','BOUNCED','COMPLAINED'));
CREATE TABLE "NotificationDeliveryEvent" (
  "id" TEXT PRIMARY KEY,
  "provider" VARCHAR(60) NOT NULL,
  "providerEventId" VARCHAR(200) NOT NULL,
  "eventType" VARCHAR(30) NOT NULL CHECK ("eventType" IN ('DELIVERED','BOUNCED','COMPLAINED')),
  "outboxId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "providerMessageId" VARCHAR(200),
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "payloadSha256" VARCHAR(64) NOT NULL,
  CONSTRAINT "NotificationDeliveryEvent_provider_event_key" UNIQUE("provider","providerEventId"),
  CONSTRAINT "NotificationDeliveryEvent_outbox_fk" FOREIGN KEY("outboxId","organizationId","schoolId") REFERENCES "NotificationOutbox"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE INDEX "NotificationDeliveryEvent_outbox_occurred_idx" ON "NotificationDeliveryEvent"("outboxId","occurredAt" DESC);
CREATE INDEX "NotificationDeliveryEvent_scope_received_idx" ON "NotificationDeliveryEvent"("organizationId","schoolId","receivedAt" DESC);
ALTER TABLE "NotificationDeliveryEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationDeliveryEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY "NotificationDeliveryEvent_tenant_policy" ON "NotificationDeliveryEvent"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
CREATE POLICY "NotificationDeliveryEvent_worker_policy" ON "NotificationDeliveryEvent"
  FOR ALL USING (current_setting('app.notification_worker', true) = 'true')
  WITH CHECK (current_setting('app.notification_worker', true) = 'true');
