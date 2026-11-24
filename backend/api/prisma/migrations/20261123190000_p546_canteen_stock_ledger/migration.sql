ALTER TABLE "CanteenStockItem" ADD COLUMN "ingredientId" TEXT;
ALTER TABLE "CanteenStockItem" ADD CONSTRAINT "CanteenStockItem_ingredient_scope_fkey" FOREIGN KEY ("ingredientId", "organizationId", "schoolId") REFERENCES "CanteenIngredient"("id", "organizationId", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CanteenStockItem" ADD CONSTRAINT "CanteenStockItem_id_org_school_key" UNIQUE ("id", "organizationId", "schoolId");
CREATE TABLE "CanteenStockLedger" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "stockItemId" TEXT NOT NULL,
  "movementType" VARCHAR(20) NOT NULL,
  "quantityDelta" DECIMAL(12,3) NOT NULL,
  "balanceAfter" DECIMAL(12,3) NOT NULL,
  "unit" VARCHAR(20) NOT NULL,
  "referenceType" VARCHAR(30),
  "referenceId" VARCHAR(100),
  "reason" VARCHAR(500),
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CanteenStockLedger_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CanteenStockLedger_stock_scope_fkey" FOREIGN KEY ("stockItemId", "organizationId", "schoolId") REFERENCES "CanteenStockItem"("id", "organizationId", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CanteenStockLedger_delta_nonzero_check" CHECK ("quantityDelta" <> 0),
  CONSTRAINT "CanteenStockLedger_balance_nonnegative_check" CHECK ("balanceAfter" >= 0)
);
CREATE INDEX "CanteenStockLedger_org_school_stock_created_idx" ON "CanteenStockLedger"("organizationId", "schoolId", "stockItemId", "createdAt");
CREATE INDEX "CanteenStockLedger_org_school_type_created_idx" ON "CanteenStockLedger"("organizationId", "schoolId", "movementType", "createdAt");
