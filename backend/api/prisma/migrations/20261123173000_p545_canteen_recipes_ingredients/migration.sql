CREATE TABLE "CanteenIngredient" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "unit" VARCHAR(20) NOT NULL DEFAULT 'g',
  "category" VARCHAR(40),
  "allergens" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenIngredient_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CanteenIngredient_id_org_school_key" ON "CanteenIngredient"("id", "organizationId", "schoolId");
CREATE UNIQUE INDEX "CanteenIngredient_schoolId_name_key" ON "CanteenIngredient"("schoolId", "name");
CREATE INDEX "CanteenIngredient_org_school_active_idx" ON "CanteenIngredient"("organizationId", "schoolId", "isActive");

CREATE TABLE "CanteenRecipe" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "yieldQuantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
  "yieldUnit" VARCHAR(30) NOT NULL DEFAULT 'serving',
  "nutrition" JSONB,
  "allergens" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "dietaryTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CanteenRecipe_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CanteenRecipe_id_org_school_key" ON "CanteenRecipe"("id", "organizationId", "schoolId");
CREATE INDEX "CanteenRecipe_org_school_active_idx" ON "CanteenRecipe"("organizationId", "schoolId", "isActive");
CREATE INDEX "CanteenRecipe_schoolId_name_idx" ON "CanteenRecipe"("schoolId", "name");

CREATE TABLE "CanteenRecipeIngredient" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "recipeId" TEXT NOT NULL,
  "ingredientId" TEXT NOT NULL,
  "quantity" DECIMAL(12,3) NOT NULL,
  "unit" VARCHAR(20) NOT NULL,
  "preparationNotes" VARCHAR(500),
  CONSTRAINT "CanteenRecipeIngredient_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CanteenRecipeIngredient_recipe_scope_fkey" FOREIGN KEY ("recipeId", "organizationId", "schoolId") REFERENCES "CanteenRecipe"("id", "organizationId", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CanteenRecipeIngredient_ingredient_scope_fkey" FOREIGN KEY ("ingredientId", "organizationId", "schoolId") REFERENCES "CanteenIngredient"("id", "organizationId", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CanteenRecipeIngredient_recipe_ingredient_key" ON "CanteenRecipeIngredient"("recipeId", "ingredientId");
CREATE INDEX "CanteenRecipeIngredient_org_school_ingredient_idx" ON "CanteenRecipeIngredient"("organizationId", "schoolId", "ingredientId");
