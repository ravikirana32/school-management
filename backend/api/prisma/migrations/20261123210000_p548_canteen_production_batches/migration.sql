CREATE TABLE "CanteenProductionBatch" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "recipeId" VARCHAR(191) NOT NULL,
  "plannedQuantity" DECIMAL(12,3) NOT NULL,
  "producedQuantity" DECIMAL(12,3),
  "servedQuantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "wastageQuantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "status" VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
  "plannedFor" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "notes" VARCHAR(1000),
  "createdBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenProductionBatch_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "CanteenProductionBatch_recipe_scope_fkey" FOREIGN KEY ("recipeId","organizationId","schoolId")
    REFERENCES "CanteenRecipe"("id","organizationId","schoolId") ON DELETE RESTRICT
);
CREATE TABLE "CanteenProductionWastage" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "batchId" VARCHAR(191) NOT NULL,
  "quantity" DECIMAL(12,3) NOT NULL,
  "reason" VARCHAR(300) NOT NULL,
  "createdBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CanteenProductionWastage_batch_scope_fkey" FOREIGN KEY ("batchId","organizationId","schoolId")
    REFERENCES "CanteenProductionBatch"("id","organizationId","schoolId") ON DELETE CASCADE
);
