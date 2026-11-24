ALTER TABLE "CurriculumLessonPlanReflection" ADD COLUMN "followUpStatus" VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE "CurriculumLessonPlanReflection" ADD COLUMN "coordinatorNotes" VARCHAR(3000);
ALTER TABLE "CurriculumLessonPlanReflection" ADD COLUMN "reviewedAt" TIMESTAMP(3);
ALTER TABLE "CurriculumLessonPlanReflection" ADD COLUMN "reviewedBy" TEXT;
ALTER TABLE "CurriculumLessonPlanReflection" ADD CONSTRAINT "CurriculumLessonPlanReflection_followup_status_check" CHECK ("followUpStatus" IN ('PENDING','IN_PROGRESS','COMPLETED'));
CREATE INDEX "CurriculumLessonPlanReflection_org_school_followup_date_idx" ON "CurriculumLessonPlanReflection"("organizationId","schoolId","followUpStatus","reflectedAt");
