CREATE TABLE `CanteenProductionBatch` (
  `id` VARCHAR(191) NOT NULL,
  `organizationId` VARCHAR(191) NOT NULL,
  `schoolId` VARCHAR(191) NOT NULL,
  `recipeId` VARCHAR(191) NOT NULL,
  `plannedQuantity` DECIMAL(12,3) NOT NULL,
  `producedQuantity` DECIMAL(12,3) NULL,
  `servedQuantity` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `wastageQuantity` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
  `plannedFor` DATETIME(3) NULL,
  `startedAt` DATETIME(3) NULL,
  `completedAt` DATETIME(3) NULL,
  `notes` VARCHAR(1000) NULL,
  `createdBy` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `CanteenProductionBatch_id_organizationId_schoolId_key` (`id`,`organizationId`,`schoolId`),
  INDEX `CanteenProductionBatch_org_school_status_plannedFor_idx` (`organizationId`,`schoolId`,`status`,`plannedFor`),
  INDEX `CanteenProductionBatch_org_school_recipe_createdAt_idx` (`organizationId`,`schoolId`,`recipeId`,`createdAt`),
  CONSTRAINT `CanteenProductionBatch_recipe_scope_fkey` FOREIGN KEY (`recipeId`,`organizationId`,`schoolId`) REFERENCES `CanteenRecipe` (`id`,`organizationId`,`schoolId`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CanteenProductionWastage` (
  `id` VARCHAR(191) NOT NULL,
  `organizationId` VARCHAR(191) NOT NULL,
  `schoolId` VARCHAR(191) NOT NULL,
  `batchId` VARCHAR(191) NOT NULL,
  `quantity` DECIMAL(12,3) NOT NULL,
  `reason` VARCHAR(300) NOT NULL,
  `createdBy` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `CanteenProductionWastage_org_school_batch_created_idx` (`organizationId`,`schoolId`,`batchId`,`createdAt`),
  CONSTRAINT `CanteenProductionWastage_batch_scope_fkey` FOREIGN KEY (`batchId`,`organizationId`,`schoolId`) REFERENCES `CanteenProductionBatch` (`id`,`organizationId`,`schoolId`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
