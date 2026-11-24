ALTER TABLE "StudentDocument" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX "StudentDocument_org_school_student_active_idx" ON "StudentDocument"("organizationId", "schoolId", "studentId", "isActive");
