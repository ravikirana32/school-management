CREATE TABLE "PayrollSalaryStructure" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "baseSalary" DECIMAL(12,2) NOT NULL,
  "components" JSONB NOT NULL DEFAULT '[]',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PayrollSalaryStructure_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PayrollSalaryStructure_organizationId_schoolId_isActive_idx" ON "PayrollSalaryStructure"("organizationId","schoolId","isActive");
CREATE TABLE "PayrollStaffAssignment" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "staffMemberId" TEXT NOT NULL,
  "structureId" TEXT NOT NULL,
  "effectiveFrom" DATE NOT NULL,
  "effectiveTo" DATE,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayrollStaffAssignment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PayrollStaffAssignment_organizationId_schoolId_staffMemberId_isActive_idx" ON "PayrollStaffAssignment"("organizationId","schoolId","staffMemberId","isActive");
CREATE INDEX "PayrollStaffAssignment_structureId_isActive_idx" ON "PayrollStaffAssignment"("structureId","isActive");
CREATE TABLE "PayrollRun" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "periodYear" INTEGER NOT NULL,
  "periodMonth" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "totalGross" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "totalDeductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "totalNet" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "createdBy" TEXT NOT NULL,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "paidBy" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PayrollRun_schoolId_periodYear_periodMonth_key" UNIQUE ("schoolId","periodYear","periodMonth")
);
CREATE INDEX "PayrollRun_organizationId_schoolId_status_idx" ON "PayrollRun"("organizationId","schoolId","status");
CREATE TABLE "PayrollRunItem" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "staffMemberId" TEXT NOT NULL,
  "employeeNumberSnapshot" TEXT NOT NULL,
  "staffNameSnapshot" TEXT NOT NULL,
  "baseSalary" DECIMAL(12,2) NOT NULL,
  "earnings" DECIMAL(12,2) NOT NULL,
  "deductions" DECIMAL(12,2) NOT NULL,
  "netPay" DECIMAL(12,2) NOT NULL,
  "componentsSnapshot" JSONB NOT NULL DEFAULT '[]',
  "paymentReference" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayrollRunItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PayrollRunItem_runId_staffMemberId_key" UNIQUE ("runId","staffMemberId"),
  CONSTRAINT "PayrollRunItem_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PayrollRunItem_organizationId_schoolId_staffMemberId_createdAt_idx" ON "PayrollRunItem"("organizationId","schoolId","staffMemberId","createdAt");
