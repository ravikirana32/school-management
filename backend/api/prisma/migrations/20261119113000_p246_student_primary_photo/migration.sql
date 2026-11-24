ALTER TABLE "StudentDocument" ADD COLUMN "isPrimaryPhoto" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "StudentDocument_school_student_primary_photo_idx" ON "StudentDocument"("organizationId", "schoolId", "studentId", "isPrimaryPhoto");
