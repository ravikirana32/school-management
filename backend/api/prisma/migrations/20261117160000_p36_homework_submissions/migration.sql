-- P36: parent-submitted homework and teacher grading lifecycle.
-- This composite key prevents a submission from pairing a homework task with another student.
ALTER TABLE "HomeworkAssignment" ADD CONSTRAINT "HomeworkAssignment_id_student_org_school_uq"
  UNIQUE ("id","studentId","organizationId","schoolId");
CREATE TABLE "HomeworkSubmission" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "homeworkAssignmentId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "submittedByUserId" TEXT NOT NULL,
  "answerText" VARCHAR(8000) NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'SUBMITTED',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "gradedByUserId" TEXT,
  "score" DECIMAL(7,2),
  "maxScore" DECIMAL(7,2),
  "teacherFeedback" VARCHAR(4000),
  "gradedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomeworkSubmission_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "HomeworkSubmission_assignment_student_fk" FOREIGN KEY ("homeworkAssignmentId","studentId","organizationId","schoolId") REFERENCES "HomeworkAssignment"("id","studentId","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "HomeworkSubmission_student_fk" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "HomeworkSubmission_status_ck" CHECK ("status" IN ('SUBMITTED','RESUBMITTED','GRADED')),
  CONSTRAINT "HomeworkSubmission_score_ck" CHECK (("score" IS NULL AND "maxScore" IS NULL) OR ("score" >= 0 AND "maxScore" > 0 AND "score" <= "maxScore")),
  CONSTRAINT "HomeworkSubmission_grade_state_ck" CHECK (("status" = 'GRADED' AND "gradedAt" IS NOT NULL AND "gradedByUserId" IS NOT NULL) OR ("status" <> 'GRADED' AND "gradedAt" IS NULL))
);
CREATE UNIQUE INDEX "HomeworkSubmission_assignment_student_uq" ON "HomeworkSubmission"("homeworkAssignmentId","studentId");
CREATE INDEX "HomeworkSubmission_assignment_status_idx" ON "HomeworkSubmission"("organizationId","schoolId","homeworkAssignmentId","status","submittedAt");
CREATE INDEX "HomeworkSubmission_student_status_idx" ON "HomeworkSubmission"("organizationId","schoolId","studentId","status","submittedAt");
ALTER TABLE "HomeworkSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HomeworkSubmission" FORCE ROW LEVEL SECURITY;
CREATE POLICY "HomeworkSubmission_tenant_policy" ON "HomeworkSubmission"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
