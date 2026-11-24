-- P323: Optional academic-year, grade and section audience targeting.
ALTER TABLE "SchoolCommunication"
  ADD COLUMN "targetAcademicYearId" TEXT,
  ADD COLUMN "targetGradeLevelId" TEXT,
  ADD COLUMN "targetSectionName" VARCHAR(40);
CREATE INDEX "SchoolCommunication_targeting_idx"
  ON "SchoolCommunication"("organizationId", "schoolId", "targetAcademicYearId", "targetGradeLevelId", "targetSectionName");
