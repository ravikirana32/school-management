CREATE TABLE "FeeInstallmentSchedule" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "chargeId" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "totalAmount" DECIMAL(12,2) NOT NULL,
  "installmentCount" INTEGER NOT NULL,
  "intervalMonths" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeeInstallmentSchedule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FeeInstallmentSchedule_charge_fk" FOREIGN KEY ("chargeId", "organizationId", "schoolId") REFERENCES "StudentFeeCharge"("id", "organizationId", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "FeeInstallmentSchedule_chargeId_organizationId_schoolId_key" ON "FeeInstallmentSchedule"("chargeId", "organizationId", "schoolId");
CREATE UNIQUE INDEX "FeeInstallmentSchedule_id_organizationId_schoolId_key" ON "FeeInstallmentSchedule"("id", "organizationId", "schoolId");
CREATE INDEX "FeeInstallmentSchedule_organizationId_schoolId_studentId_createdAt_idx" ON "FeeInstallmentSchedule"("organizationId", "schoolId", "studentId", "createdAt");

CREATE TABLE "FeeInstallment" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "scheduleId" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "dueAt" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeeInstallment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FeeInstallment_schedule_fk" FOREIGN KEY ("scheduleId", "organizationId", "schoolId") REFERENCES "FeeInstallmentSchedule"("id", "organizationId", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "FeeInstallment_scheduleId_sequence_key" ON "FeeInstallment"("scheduleId", "sequence");
CREATE UNIQUE INDEX "FeeInstallment_id_organizationId_schoolId_key" ON "FeeInstallment"("id", "organizationId", "schoolId");
CREATE INDEX "FeeInstallment_organizationId_schoolId_dueAt_status_idx" ON "FeeInstallment"("organizationId", "schoolId", "dueAt", "status");
