-- P551: structured menu allergens and student dietary safety profiles.
ALTER TABLE "CanteenMenuItem" ADD COLUMN IF NOT EXISTS "allergens" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
CREATE TABLE IF NOT EXISTS "CanteenStudentDietarySafety" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "allergens" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "dietaryRestrictions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "notes" VARCHAR(300),
  "reviewedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenStudentDietarySafety_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CanteenStudentDietarySafety_org_school_student_key" UNIQUE ("organizationId", "schoolId", "studentId")
);
CREATE INDEX IF NOT EXISTS "CanteenStudentDietarySafety_org_school_updated_idx" ON "CanteenStudentDietarySafety"("organizationId", "schoolId", "updatedAt");
