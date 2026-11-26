CREATE TABLE "CanteenSupplier" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "name" VARCHAR(191) NOT NULL,
  "contactName" VARCHAR(191),
  "phone" VARCHAR(191),
  "email" VARCHAR(191),
  "address" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenSupplier_id_org_school_key" UNIQUE ("id","organizationId","schoolId")
);

CREATE TABLE "CanteenPurchaseOrder" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "supplierId" VARCHAR(191) NOT NULL,
  "orderNumber" VARCHAR(191) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expectedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenPurchaseOrder_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "CanteenPurchaseOrder_supplier_scope_fkey"
    FOREIGN KEY ("supplierId","organizationId","schoolId")
    REFERENCES "CanteenSupplier"("id","organizationId","schoolId") ON DELETE RESTRICT
);

CREATE TABLE "CanteenPurchaseOrderLine" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "purchaseOrderId" VARCHAR(191) NOT NULL,
  "stockItemId" VARCHAR(191) NOT NULL,
  "orderedQuantity" DECIMAL(12,3) NOT NULL,
  "receivedQuantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "unitCost" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "CanteenPurchaseOrderLine_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "CanteenPurchaseOrderLine_purchase_order_scope_fkey"
    FOREIGN KEY ("purchaseOrderId","organizationId","schoolId")
    REFERENCES "CanteenPurchaseOrder"("id","organizationId","schoolId") ON DELETE CASCADE
);

CREATE TABLE "CanteenStockLot" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "stockItemId" VARCHAR(191) NOT NULL,
  "purchaseOrderId" VARCHAR(191),
  "purchaseOrderLineId" VARCHAR(191),
  "lotCode" VARCHAR(191) NOT NULL,
  "receivedQuantity" DECIMAL(12,3) NOT NULL,
  "remainingQuantity" DECIMAL(12,3) NOT NULL,
  "unit" VARCHAR(20) NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiryDate" TIMESTAMP(3),
  "supplierName" VARCHAR(191),
  "notes" TEXT,
  "createdBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CanteenStockLot_id_org_school_key" UNIQUE ("id","organizationId","schoolId")
);
