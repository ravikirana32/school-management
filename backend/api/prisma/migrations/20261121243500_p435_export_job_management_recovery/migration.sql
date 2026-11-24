ALTER TABLE "TeacherTaskReminderPolicyExportJob" ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TeacherTaskReminderPolicyExportJob" ADD CONSTRAINT "TeacherTaskReminderPolicyExportJob_attemptCount_check" CHECK ("attemptCount" >= 0 AND "attemptCount" <= 3);
