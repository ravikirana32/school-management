CREATE TABLE "CanteenPreorderPolicy" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "serviceTime" TEXT NOT NULL DEFAULT '12:00',
  "cutoffMinutesBeforeService" INTEGER NOT NULL DEFAULT 60,
  "allowCancellation" BOOLEAN NOT NULL DEFAULT true,
  "cancellationCutoffMinutes" INTEGER NOT NULL DEFAULT 60,
  "refundMode" TEXT NOT NULL DEFAULT 'MANUAL',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenPreorderPolicy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CanteenPreorderPolicy_organizationId_schoolId_key" ON "CanteenPreorderPolicy"("organizationId","schoolId");
CREATE TABLE "CanteenPreorder" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "serviceDate" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PLACED',
  "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
  "total" DECIMAL(10,2) NOT NULL,
  "cancelledAt" TIMESTAMP(3),
  "cancellationReason" TEXT,
  "refundStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
  "refundAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "refundReference" TEXT,
  "refundRequestedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenPreorder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CanteenPreorder_organizationId_schoolId_studentId_serviceDate_idx" ON "CanteenPreorder"("organizationId","schoolId","studentId","serviceDate");
CREATE INDEX "CanteenPreorder_schoolId_status_serviceDate_idx" ON "CanteenPreorder"("schoolId","status","serviceDate");
CREATE INDEX "CanteenPreorder_schoolId_refundStatus_idx" ON "CanteenPreorder"("schoolId","refundStatus");
CREATE TABLE "CanteenPreorderItem" (
  "id" TEXT NOT NULL,
  "preorderId" TEXT NOT NULL,
  "menuItemId" TEXT NOT NULL,
  "itemName" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "lineTotal" DECIMAL(10,2) NOT NULL,
  CONSTRAINT "CanteenPreorderItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CanteenPreorderItem_preorderId_fkey" FOREIGN KEY ("preorderId") REFERENCES "CanteenPreorder"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CanteenPreorderItem_preorderId_idx" ON "CanteenPreorderItem"("preorderId");
