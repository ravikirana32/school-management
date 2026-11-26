-- P243: expand student records with previous-school and medical profile details.
ALTER TABLE "Student"
  ADD COLUMN "previousSchoolName" VARCHAR(191),
  ADD COLUMN "previousSchoolBoard" VARCHAR(191),
  ADD COLUMN "previousSchoolGrade" VARCHAR(191),
  ADD COLUMN "previousSchoolLeavingDate" DATE,
  ADD COLUMN "medicalConditions" TEXT,
  ADD COLUMN "allergies" TEXT,
  ADD COLUMN "medicationNotes" TEXT,
  ADD COLUMN "emergencyMedicalNotes" TEXT;
