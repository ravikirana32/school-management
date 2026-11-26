CREATE TABLE "LibraryFineLedgerEntry" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "loanId" VARCHAR(191),
  "borrowerId" VARCHAR(191) NOT NULL,
  "borrowerType" VARCHAR(191) NOT NULL DEFAULT 'STUDENT',
  "type" VARCHAR(191) NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "reason" VARCHAR(191),
  "paymentReference" VARCHAR(191),
  "createdBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
