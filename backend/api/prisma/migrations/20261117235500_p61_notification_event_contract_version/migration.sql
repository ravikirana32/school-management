-- P61: persist the canonical notification event contract version.
ALTER TABLE "NotificationDeliveryEvent"
ADD COLUMN "contractVersion" VARCHAR(20) NOT NULL DEFAULT 'v1';
