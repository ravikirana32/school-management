-- P31: parent delivery worker outbox access, consent withdrawal and parent portal lookup indexes.
ALTER TABLE "StudentDocument" ADD COLUMN "scanRequestedAt" TIMESTAMP(3);
ALTER TABLE "StaffDocument" ADD COLUMN "scanRequestedAt" TIMESTAMP(3);
ALTER TABLE "ParentInvitation" ADD COLUMN "consentWithdrawnAt" TIMESTAMP(3);
ALTER TABLE "ParentInvitation" ADD COLUMN "consentNoticeText" VARCHAR(4000) NOT NULL DEFAULT 'Please review the parent portal consent notice supplied by your school before accepting.';

-- Worker policy is installed before the P30 outbox cleanup because ParentInvitation
-- is FORCE ROW LEVEL SECURITY. The migration uses a transaction-local service GUC
-- for this one data update, then resets it; runtime worker credentials remain separate.
CREATE POLICY "parent_invitation_delivery_worker_read" ON "ParentInvitation"
  FOR SELECT USING (current_setting('app.parent_delivery_worker', true) = 'true');
CREATE POLICY "parent_invitation_delivery_worker_update" ON "ParentInvitation"
  FOR UPDATE
  USING (current_setting('app.parent_delivery_worker', true) = 'true')
  WITH CHECK (current_setting('app.parent_delivery_worker', true) = 'true');
SET app.parent_delivery_worker = 'true';
-- P30 pending invitations did not persist the exact notice text. Revoke them so
-- no invitation can be delivered without the versioned notice displayed to parent.
UPDATE "ParentInvitation"
SET "status"='REVOKED',"deliveryStatus"='CANCELLED',"deliveryCiphertext"='',"deliveryNonce"='',"deliveryTag"=''
WHERE "status"='PENDING';
RESET app.parent_delivery_worker;

CREATE INDEX "ParentInvitation_consent_withdrawal_idx" ON "ParentInvitation"("acceptedByUserId", "organizationId", "schoolId", "consentWithdrawnAt");
CREATE INDEX "Guardian_user_school_active_idx" ON "Guardian"("userId", "organizationId", "schoolId", "isActive");
CREATE INDEX "ParentInvitation_accepted_guardian_user_idx" ON "ParentInvitation"("guardianId", "organizationId", "schoolId", "acceptedByUserId", "status");
CREATE INDEX "StudentGuardian_parent_visible_idx" ON "StudentGuardian"("guardianId", "organizationId", "schoolId", "canReceiveCommunications");
CREATE INDEX "StudentAttendance_parent_history_idx" ON "StudentAttendance"("studentId", "schoolId", "sessionId", "markedAt" DESC);

CREATE POLICY "student_document_scan_worker_read" ON "StudentDocument"
  FOR SELECT USING (current_setting('app.document_scan_worker', true) = 'true' AND "securityStatus" = 'QUARANTINED');
CREATE POLICY "student_document_scan_worker_update" ON "StudentDocument"
  FOR UPDATE USING (current_setting('app.document_scan_worker', true) = 'true' AND "securityStatus" = 'QUARANTINED')
  WITH CHECK (current_setting('app.document_scan_worker', true) = 'true' AND "securityStatus" = 'QUARANTINED');
CREATE POLICY "staff_document_scan_worker_read" ON "StaffDocument"
  FOR SELECT USING (current_setting('app.document_scan_worker', true) = 'true' AND "securityStatus" = 'QUARANTINED');
CREATE POLICY "staff_document_scan_worker_update" ON "StaffDocument"
  FOR UPDATE USING (current_setting('app.document_scan_worker', true) = 'true' AND "securityStatus" = 'QUARANTINED')
  WITH CHECK (current_setting('app.document_scan_worker', true) = 'true' AND "securityStatus" = 'QUARANTINED');
