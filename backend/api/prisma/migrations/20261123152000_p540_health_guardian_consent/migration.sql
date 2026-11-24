CREATE TABLE `StudentHealthConsent` (
  `id` VARCHAR(191) NOT NULL,
  `organizationId` VARCHAR(191) NOT NULL,
  `schoolId` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL,
  `guardianId` VARCHAR(191) NOT NULL,
  `grantedAt` DATETIME(3) NULL,
  `revokedAt` DATETIME(3) NULL,
  `consentVersion` VARCHAR(191) NOT NULL DEFAULT 'health-visibility-v1',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `StudentHealthConsent_scope_student_guardian_key` (`organizationId`, `schoolId`, `studentId`, `guardianId`),
  INDEX `StudentHealthConsent_scope_guardian_revoked_idx` (`organizationId`, `schoolId`, `guardianId`, `revokedAt`),
  INDEX `StudentHealthConsent_scope_student_revoked_idx` (`organizationId`, `schoolId`, `studentId`, `revokedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
