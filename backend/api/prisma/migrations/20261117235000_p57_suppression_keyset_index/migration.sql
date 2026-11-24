-- P57: supports stable tenant/status keyset pagination for the suppression operations list.
CREATE INDEX "NotificationEmailSuppression_tenant_status_created_id_idx"
ON "NotificationEmailSuppression"("organizationId", "schoolId", "status", "createdAt" DESC, "id" DESC);
