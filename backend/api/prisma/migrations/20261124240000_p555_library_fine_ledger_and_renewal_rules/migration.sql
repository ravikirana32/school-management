-- P555 library fine ledger and audited fine adjustments/settlements
CREATE TABLE `LibraryFineLedgerEntry` (
  `id` VARCHAR(191) NOT NULL, `organizationId` VARCHAR(191) NOT NULL, `schoolId` VARCHAR(191) NOT NULL,
  `loanId` VARCHAR(191) NULL, `borrowerId` VARCHAR(191) NOT NULL, `borrowerType` VARCHAR(191) NOT NULL DEFAULT 'STUDENT',
  `type` VARCHAR(191) NOT NULL, `amount` DECIMAL(10,2) NOT NULL, `reason` VARCHAR(191) NULL,
  `paymentReference` VARCHAR(191) NULL, `createdBy` VARCHAR(191) NOT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), INDEX `LibraryFineLedgerEntry_org_school_borrower_created_idx` (`organizationId`,`schoolId`,`borrowerId`,`createdAt`),
  INDEX `LibraryFineLedgerEntry_loan_type_idx` (`loanId`,`type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
