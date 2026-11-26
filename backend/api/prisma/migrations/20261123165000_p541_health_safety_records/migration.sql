CREATE TABLE "StudentHealthAllergy" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "studentId" VARCHAR(191) NOT NULL,
  "substance" VARCHAR(160) NOT NULL,
  "reaction" TEXT,
  "severity" VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
  "notes" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "recordedBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentHealthAllergy_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "StudentHealthAllergy_student_scope_fk" FOREIGN KEY ("studentId","organizationId","schoolId")
    REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE INDEX "StudentHealthAllergy_org_school_student_active_idx"
  ON "StudentHealthAllergy"("organizationId","schoolId","studentId","active");

CREATE TABLE "StudentHealthCondition" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "studentId" VARCHAR(191) NOT NULL,
  "condition" VARCHAR(160) NOT NULL,
  "severity" VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
  "diagnosedAt" TIMESTAMP(3),
  "notes" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "recordedBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentHealthCondition_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "StudentHealthCondition_student_scope_fk" FOREIGN KEY ("studentId","organizationId","schoolId")
    REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE INDEX "StudentHealthCondition_org_school_student_active_idx"
  ON "StudentHealthCondition"("organizationId","schoolId","studentId","active");

CREATE TABLE "StudentHealthMedication" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "studentId" VARCHAR(191) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "dosage" VARCHAR(160),
  "frequency" VARCHAR(160),
  "instructions" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "recordedBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentHealthMedication_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "StudentHealthMedication_student_scope_fk" FOREIGN KEY ("studentId","organizationId","schoolId")
    REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE INDEX "StudentHealthMedication_org_school_student_active_idx"
  ON "StudentHealthMedication"("organizationId","schoolId","studentId","active");
