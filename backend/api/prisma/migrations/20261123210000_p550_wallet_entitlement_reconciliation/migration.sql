CREATE TABLE `CanteenStudentWallet` (
  `id` VARCHAR(191) NOT NULL, `organizationId` VARCHAR(191) NOT NULL, `schoolId` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL, `balance` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'INR', `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE INDEX `CanteenStudentWallet_org_school_student_key` (`organizationId`,`schoolId`,`studentId`), INDEX `CanteenStudentWallet_school_balance_idx` (`schoolId`,`balance`)
);
CREATE TABLE `CanteenWalletTransaction` (
  `id` VARCHAR(191) NOT NULL, `organizationId` VARCHAR(191) NOT NULL, `schoolId` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL, `walletId` VARCHAR(191) NOT NULL, `type` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL, `balanceAfter` DECIMAL(12,2) NOT NULL, `referenceType` VARCHAR(191) NULL,
  `referenceId` VARCHAR(191) NULL, `idempotencyKey` VARCHAR(191) NULL, `note` VARCHAR(191) NULL,
  `createdBy` VARCHAR(191) NOT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), UNIQUE INDEX `CanteenWalletTransaction_org_school_idempotency_key` (`organizationId`,`schoolId`,`idempotencyKey`),
  INDEX `CanteenWalletTransaction_org_school_student_created_idx` (`organizationId`,`schoolId`,`studentId`,`createdAt`),
  INDEX `CanteenWalletTransaction_school_ref_idx` (`schoolId`,`referenceType`,`referenceId`),
  CONSTRAINT `CanteenWalletTransaction_wallet_fkey` FOREIGN KEY (`walletId`) REFERENCES `CanteenStudentWallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE `CanteenMealEntitlement` (
  `id` VARCHAR(191) NOT NULL, `organizationId` VARCHAR(191) NOT NULL, `schoolId` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL, `entitlementName` VARCHAR(191) NOT NULL DEFAULT 'Meal entitlement',
  `totalMeals` INTEGER NOT NULL, `consumedMeals` INTEGER NOT NULL DEFAULT 0, `validFrom` DATE NOT NULL,
  `validTo` DATE NULL, `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE', `createdBy` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), INDEX `CanteenMealEntitlement_org_school_student_status_from_idx` (`organizationId`,`schoolId`,`studentId`,`status`,`validFrom`)
);
