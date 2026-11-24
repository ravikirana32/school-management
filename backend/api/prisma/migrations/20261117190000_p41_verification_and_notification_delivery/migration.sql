-- P41: high-entropy public verification codes and narrowly scoped worker RLS policies.
ALTER TABLE "ReportCardPdfArtifact" ADD COLUMN "verificationCode" VARCHAR(32);
UPDATE "ReportCardPdfArtifact" SET "verificationCode" = upper(substr(md5(random()::text || "id" || clock_timestamp()::text), 1, 32)) WHERE "verificationCode" IS NULL;
ALTER TABLE "ReportCardPdfArtifact" ALTER COLUMN "verificationCode" SET NOT NULL;
CREATE UNIQUE INDEX "ReportCardPdfArtifact_verificationCode_key" ON "ReportCardPdfArtifact"("verificationCode");

-- Worker can only process notification records and re-check the minimum parent consent graph.
CREATE POLICY "NotificationOutbox_p41_worker_policy" ON "NotificationOutbox"
  FOR ALL USING (current_setting('app.notification_worker', true) = 'true')
  WITH CHECK (current_setting('app.notification_worker', true) = 'true');
CREATE POLICY "NotificationPreference_p41_worker_policy" ON "NotificationPreference"
  FOR SELECT USING (current_setting('app.notification_worker', true) = 'true');
CREATE POLICY "Guardian_p41_notification_worker_policy" ON "Guardian"
  FOR SELECT USING (current_setting('app.notification_worker', true) = 'true');
CREATE POLICY "StudentGuardian_p41_notification_worker_policy" ON "StudentGuardian"
  FOR SELECT USING (current_setting('app.notification_worker', true) = 'true');
CREATE POLICY "ParentInvitation_p41_notification_worker_policy" ON "ParentInvitation"
  FOR SELECT USING (current_setting('app.notification_worker', true) = 'true');

-- Public verification is read-only and code-addressed; it never exposes student identity or marks.
CREATE POLICY "ReportCardPdfArtifact_p41_public_verify_policy" ON "ReportCardPdfArtifact"
  FOR SELECT USING (current_setting('app.report_card_verification', true) = 'true');
CREATE POLICY "StudentReportCard_p41_public_verify_policy" ON "StudentReportCard"
  FOR SELECT USING (current_setting('app.report_card_verification', true) = 'true');
CREATE POLICY "School_p41_public_verify_policy" ON "School"
  FOR SELECT USING (current_setting('app.report_card_verification', true) = 'true');
CREATE POLICY "AcademicYear_p41_public_verify_policy" ON "AcademicYear"
  FOR SELECT USING (current_setting('app.report_card_verification', true) = 'true');
