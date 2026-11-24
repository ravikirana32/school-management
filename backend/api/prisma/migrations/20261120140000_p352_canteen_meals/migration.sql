CREATE TABLE "CanteenMenuItem" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'MEAL',
  "price" DECIMAL(10,2) NOT NULL,
  "dietaryTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "availableOn" DATE,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenMenuItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CanteenMenuItem_organizationId_schoolId_isAvailable_idx" ON "CanteenMenuItem"("organizationId","schoolId","isAvailable");
CREATE INDEX "CanteenMenuItem_schoolId_availableOn_idx" ON "CanteenMenuItem"("schoolId","availableOn");
CREATE TABLE "CanteenMealPlan" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "startDate" DATE,
  "endDate" DATE,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenMealPlan_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CanteenMealPlan_organizationId_schoolId_isActive_idx" ON "CanteenMealPlan"("organizationId","schoolId","isActive");
CREATE TABLE "CanteenMealAllocation" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "mealPlanId" TEXT,
  "validFrom" DATE NOT NULL,
  "validTo" DATE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenMealAllocation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CanteenMealAllocation_organizationId_schoolId_studentId_status_idx" ON "CanteenMealAllocation"("organizationId","schoolId","studentId","status");
CREATE INDEX "CanteenMealAllocation_schoolId_mealPlanId_idx" ON "CanteenMealAllocation"("schoolId","mealPlanId");
CREATE TABLE "CanteenOrder" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "orderDate" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PLACED',
  "total" DECIMAL(10,2) NOT NULL,
  "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
  "paymentMethod" TEXT,
  "paymentReference" TEXT,
  "paidAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdBy" TEXT NOT NULL,
  "servedBy" TEXT,
  "servedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenOrder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CanteenOrder_organizationId_schoolId_studentId_orderDate_idx" ON "CanteenOrder"("organizationId","schoolId","studentId","orderDate");
CREATE INDEX "CanteenOrder_schoolId_status_orderDate_idx" ON "CanteenOrder"("schoolId","status","orderDate");
CREATE TABLE "CanteenOrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "menuItemId" TEXT NOT NULL,
  "itemName" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "lineTotal" DECIMAL(10,2) NOT NULL,
  CONSTRAINT "CanteenOrderItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CanteenOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CanteenOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CanteenOrderItem_orderId_idx" ON "CanteenOrderItem"("orderId");
CREATE TABLE "CanteenStockItem" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "unit" TEXT NOT NULL DEFAULT 'unit',
  "quantity" DECIMAL(12,3) NOT NULL,
  "reorderLevel" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenStockItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CanteenStockItem_schoolId_name_key" ON "CanteenStockItem"("schoolId","name");
CREATE INDEX "CanteenStockItem_organizationId_schoolId_idx" ON "CanteenStockItem"("organizationId","schoolId");
