-- P243: expand student records with previous-school and medical profile details.
ALTER TABLE `Student`
  ADD COLUMN `previousSchoolName` VARCHAR(191) NULL,
  ADD COLUMN `previousSchoolBoard` VARCHAR(191) NULL,
  ADD COLUMN `previousSchoolGrade` VARCHAR(191) NULL,
  ADD COLUMN `previousSchoolLeavingDate` DATE NULL,
  ADD COLUMN `medicalConditions` TEXT NULL,
  ADD COLUMN `allergies` TEXT NULL,
  ADD COLUMN `medicationNotes` TEXT NULL,
  ADD COLUMN `emergencyMedicalNotes` TEXT NULL;
