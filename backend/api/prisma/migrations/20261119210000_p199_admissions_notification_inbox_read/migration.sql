ALTER TABLE "NotificationOutbox" ADD COLUMN "readAt" TIMESTAMP(3);
CREATE INDEX "NotificationOutbox_school_recipient_read_created_idx" ON "NotificationOutbox"("organizationId", "schoolId", "recipientUserId", "readAt", "createdAt");
