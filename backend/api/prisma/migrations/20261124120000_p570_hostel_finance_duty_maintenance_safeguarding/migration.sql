CREATE TABLE "HostelFeePlan" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "name" TEXT NOT NULL, "academicYear" TEXT NOT NULL,
 "hostelType" TEXT NOT NULL DEFAULT 'ANY', "buildingId" TEXT, "roomType" TEXT, "billingFrequency" TEXT NOT NULL DEFAULT 'MONTHLY',
 "amount" DECIMAL(12,2) NOT NULL, "effectiveFrom" TIMESTAMP(3) NOT NULL, "effectiveTo" TIMESTAMP(3), "lateFeeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
 "lateFeeAfterDays" INTEGER NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'ACTIVE', "createdBy" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "HostelFeePlan_pkey" PRIMARY KEY ("id"));
CREATE TABLE "HostelFeeInvoice" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "allocationId" TEXT NOT NULL, "studentId" TEXT NOT NULL,
 "feePlanId" TEXT, "invoiceNumber" TEXT NOT NULL, "periodStart" TIMESTAMP(3) NOT NULL, "periodEnd" TIMESTAMP(3) NOT NULL, "dueAt" TIMESTAMP(3) NOT NULL,
 "baseAmount" DECIMAL(12,2) NOT NULL, "concessionAmount" DECIMAL(12,2) NOT NULL DEFAULT 0, "lateFeeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
 "totalAmount" DECIMAL(12,2) NOT NULL, "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'ISSUED', "calculation" JSONB NOT NULL,
 "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "HostelFeeInvoice_pkey" PRIMARY KEY ("id"));
CREATE TABLE "HostelPaymentRecord" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "invoiceId" TEXT NOT NULL, "studentId" TEXT NOT NULL,
 "amount" DECIMAL(12,2) NOT NULL, "method" TEXT NOT NULL, "reference" TEXT, "status" TEXT NOT NULL DEFAULT 'RECORDED', "recordedBy" TEXT NOT NULL,
 "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "reversalOfId" TEXT, CONSTRAINT "HostelPaymentRecord_pkey" PRIMARY KEY ("id"));
CREATE TABLE "HostelDutyAssignment" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "buildingId" TEXT NOT NULL, "staffUserId" TEXT NOT NULL, "shiftName" TEXT NOT NULL,
 "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3) NOT NULL, "status" TEXT NOT NULL DEFAULT 'ASSIGNED', "handoverNote" VARCHAR(2000),
 "assignedBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "HostelDutyAssignment_pkey" PRIMARY KEY ("id"));
CREATE TABLE "HostelMaintenanceTicket" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "buildingId" TEXT, "roomId" TEXT, "bedId" TEXT, "title" TEXT NOT NULL,
 "description" VARCHAR(3000) NOT NULL, "priority" TEXT NOT NULL DEFAULT 'MEDIUM', "status" TEXT NOT NULL DEFAULT 'OPEN', "slaDueAt" TIMESTAMP(3),
 "assignedTo" TEXT, "estimatedCost" DECIMAL(12,2), "actualCost" DECIMAL(12,2), "partsUsed" JSONB, "closureEvidence" VARCHAR(2000),
 "reportedBy" TEXT NOT NULL, "approvedBy" TEXT, "closedBy" TEXT, "closedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "HostelMaintenanceTicket_pkey" PRIMARY KEY ("id"));
CREATE TABLE "HostelSafeguardingCase" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "studentId" TEXT, "referenceCode" TEXT NOT NULL, "category" TEXT NOT NULL,
 "severity" TEXT NOT NULL DEFAULT 'MEDIUM', "status" TEXT NOT NULL DEFAULT 'OPEN', "summary" VARCHAR(1000) NOT NULL, "restrictedDetails" TEXT, "responsePlan" TEXT,
 "ownerUserId" TEXT NOT NULL, "escalationDueAt" TIMESTAMP(3), "createdBy" TEXT NOT NULL, "reviewedBy" TEXT, "reviewedAt" TIMESTAMP(3),
 "closedBy" TEXT, "closedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "HostelSafeguardingCase_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "HostelFeePlan_id_organizationId_schoolId_key" ON "HostelFeePlan"("id","organizationId","schoolId");
CREATE INDEX "HostelFeePlan_org_school_year_status_effectiveFrom_idx" ON "HostelFeePlan"("organizationId","schoolId","academicYear","status","effectiveFrom");
CREATE UNIQUE INDEX "HostelFeeInvoice_org_school_invoiceNumber_key" ON "HostelFeeInvoice"("organizationId","schoolId","invoiceNumber");
CREATE UNIQUE INDEX "HostelFeeInvoice_id_organizationId_schoolId_key" ON "HostelFeeInvoice"("id","organizationId","schoolId");
CREATE INDEX "HostelFeeInvoice_org_school_student_status_dueAt_idx" ON "HostelFeeInvoice"("organizationId","schoolId","studentId","status","dueAt");
CREATE INDEX "HostelFeeInvoice_org_school_allocation_periodStart_idx" ON "HostelFeeInvoice"("organizationId","schoolId","allocationId","periodStart");
CREATE INDEX "HostelPaymentRecord_org_school_invoice_recordedAt_idx" ON "HostelPaymentRecord"("organizationId","schoolId","invoiceId","recordedAt");
CREATE INDEX "HostelPaymentRecord_org_school_student_recordedAt_idx" ON "HostelPaymentRecord"("organizationId","schoolId","studentId","recordedAt");
CREATE INDEX "HostelDutyAssignment_org_school_building_starts_ends_idx" ON "HostelDutyAssignment"("organizationId","schoolId","buildingId","startsAt","endsAt");
CREATE INDEX "HostelDutyAssignment_org_school_staff_starts_ends_idx" ON "HostelDutyAssignment"("organizationId","schoolId","staffUserId","startsAt","endsAt");
CREATE INDEX "HostelMaintenanceTicket_org_school_status_priority_createdAt_idx" ON "HostelMaintenanceTicket"("organizationId","schoolId","status","priority","createdAt");
CREATE INDEX "HostelMaintenanceTicket_org_school_bed_status_idx" ON "HostelMaintenanceTicket"("organizationId","schoolId","bedId","status");
CREATE UNIQUE INDEX "HostelSafeguardingCase_org_school_referenceCode_key" ON "HostelSafeguardingCase"("organizationId","schoolId","referenceCode");
CREATE INDEX "HostelSafeguardingCase_org_school_status_severity_createdAt_idx" ON "HostelSafeguardingCase"("organizationId","schoolId","status","severity","createdAt");
CREATE INDEX "HostelSafeguardingCase_org_school_owner_status_idx" ON "HostelSafeguardingCase"("organizationId","schoolId","ownerUserId","status");
INSERT INTO "Permission" ("id","key","module","action","description","createdAt")
VALUES ('p570-hostel-safeguarding-read','hostel.safeguarding.read','hostel.safeguarding','read','Read restricted hostel safeguarding case summaries and case details',CURRENT_TIMESTAMP),
       ('p570-hostel-safeguarding-manage','hostel.safeguarding.manage','hostel.safeguarding','manage','Create and review restricted hostel safeguarding cases',CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
INSERT INTO "RolePermission" ("id","roleId","permissionId","createdAt")
SELECT 'p570-hostel-safeguarding:' || r."id" || ':' || p."id",r."id",p."id",CURRENT_TIMESTAMP
FROM "Role" r CROSS JOIN "Permission" p
WHERE r."key" IN ('SCHOOL_HOSTEL_STAFF','SCHOOL_PRINCIPAL') AND p."key" IN ('hostel.safeguarding.read','hostel.safeguarding.manage')
ON CONFLICT ("roleId","permissionId") DO NOTHING;
CREATE TABLE "HostelDepositAccount" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "allocationId" TEXT NOT NULL, "studentId" TEXT NOT NULL,
 "collectedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0, "deductedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0, "refundedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
 "balance" DECIMAL(12,2) NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'OPEN', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "HostelDepositAccount_pkey" PRIMARY KEY ("id"), CONSTRAINT "HostelDepositAccount_id_org_school_key" UNIQUE ("id","organizationId","schoolId"));
CREATE TABLE "HostelDepositEvent" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "accountId" TEXT NOT NULL, "eventType" TEXT NOT NULL,
 "amount" DECIMAL(12,2) NOT NULL, "status" TEXT NOT NULL DEFAULT 'POSTED', "reason" VARCHAR(1000) NOT NULL, "reference" TEXT,
 "requestedBy" TEXT NOT NULL, "approvedBy" TEXT, "approvedAt" TIMESTAMP(3), "executedBy" TEXT, "executedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "HostelDepositEvent_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "HostelDepositEvent_account_fkey" FOREIGN KEY ("accountId","organizationId","schoolId") REFERENCES "HostelDepositAccount"("id","organizationId","schoolId") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE UNIQUE INDEX "HostelDepositAccount_org_school_allocation_key" ON "HostelDepositAccount"("organizationId","schoolId","allocationId");
CREATE INDEX "HostelDepositAccount_org_school_student_status_idx" ON "HostelDepositAccount"("organizationId","schoolId","studentId","status");
CREATE INDEX "HostelDepositEvent_org_school_account_createdAt_idx" ON "HostelDepositEvent"("organizationId","schoolId","accountId","createdAt");
CREATE INDEX "HostelDepositEvent_org_school_type_status_idx" ON "HostelDepositEvent"("organizationId","schoolId","eventType","status");
