CREATE UNIQUE INDEX "AttendanceSession_organizationId_schoolId_academicYearId_gradeLevelId_sectionName_sessionDate_key"
  ON "AttendanceSession"("organizationId","schoolId","academicYearId","gradeLevelId","sectionName","sessionDate");
