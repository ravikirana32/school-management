-- P541: structured health safety records. All records are tenant/school/student scoped.
CREATE TABLE `StudentHealthAllergy` (
  `id` VARCHAR(191) NOT NULL, `organizationId` VARCHAR(191) NOT NULL, `schoolId` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL,
  `substance` VARCHAR(160) NOT NULL, `reaction` TEXT NULL, `severity` VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN', `notes` TEXT NULL, `active` BOOLEAN NOT NULL DEFAULT true, `recordedBy` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `StudentHealthAllergy_id_org_school_key` (`id`,`organizationId`,`schoolId`), INDEX `StudentHealthAllergy_org_school_student_active_idx` (`organizationId`,`schoolId`,`studentId`,`active`),
  CONSTRAINT `StudentHealthAllergy_student_scope_fk` FOREIGN KEY (`studentId`,`organizationId`,`schoolId`) REFERENCES `Student` (`id`,`organizationId`,`schoolId`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE `StudentHealthCondition` (
  `id` VARCHAR(191) NOT NULL, `organizationId` VARCHAR(191) NOT NULL, `schoolId` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `condition` VARCHAR(160) NOT NULL, `severity` VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN', `diagnosedAt` DATETIME(3) NULL, `notes` TEXT NULL, `active` BOOLEAN NOT NULL DEFAULT true, `recordedBy` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `StudentHealthCondition_id_org_school_key` (`id`,`organizationId`,`schoolId`), INDEX `StudentHealthCondition_org_school_student_active_idx` (`organizationId`,`schoolId`,`studentId`,`active`),
  CONSTRAINT `StudentHealthCondition_student_scope_fk` FOREIGN KEY (`studentId`,`organizationId`,`schoolId`) REFERENCES `Student` (`id`,`organizationId`,`schoolId`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE `StudentHealthMedication` (
  `id` VARCHAR(191) NOT NULL, `organizationId` VARCHAR(191) NOT NULL, `schoolId` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `name` VARCHAR(160) NOT NULL, `dosage` VARCHAR(160) NULL, `frequency` VARCHAR(160) NULL, `instructions` TEXT NULL, `startDate` DATETIME(3) NULL, `endDate` DATETIME(3) NULL, `active` BOOLEAN NOT NULL DEFAULT true, `recordedBy` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `StudentHealthMedication_id_org_school_key` (`id`,`organizationId`,`schoolId`), INDEX `StudentHealthMedication_org_school_student_active_idx` (`organizationId`,`schoolId`,`studentId`,`active`),
  CONSTRAINT `StudentHealthMedication_student_scope_fk` FOREIGN KEY (`studentId`,`organizationId`,`schoolId`) REFERENCES `Student` (`id`,`organizationId`,`schoolId`) ON DELETE CASCADE ON UPDATE CASCADE
);
