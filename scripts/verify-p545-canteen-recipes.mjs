import fs from 'node:fs';
const root=new URL('../',import.meta.url).pathname;
const read=(p)=>fs.readFileSync(root+p,'utf8');
const schema=read('backend/api/prisma/schema.prisma');
const routes=read('backend/api/src/modules/canteen/canteen.routes.ts');
const migration=read('backend/api/prisma/migrations/20261123173000_p545_canteen_recipes_ingredients/migration.sql');
const ui=read('apps/school-admin/src/CanteenWorkspace.tsx');
const checks=[
['ingredient model declared',schema.includes('model CanteenIngredient {')],
['recipe model declared',schema.includes('model CanteenRecipe {')],
['recipe ingredient composition model declared',schema.includes('model CanteenRecipeIngredient {')],
['tenant composite unique constraints',schema.includes('@@unique([id, organizationId, schoolId])')],
['ingredient school name uniqueness',schema.includes('@@unique([schoolId, name])')],
['recipe yield quantity/unit fields',schema.includes('yieldQuantity Decimal')&&schema.includes('yieldUnit String')],
['nutrition JSON metadata',schema.includes('nutrition Json?')],
['allergen and dietary metadata',schema.includes('allergens String[]')&&schema.includes('dietaryTags String[]')],
['ingredient quantity positive validation',/quantity\s*:\s*z\.number\(\)\.positive\(\)/.test(routes)],
['tenant scoped ingredient list endpoint',routes.includes('base+"/ingredients"')&&routes.includes('organizationId:s.organizationId,schoolId:s.schoolId,isActive:true')],
['ingredient create permission gate',routes.includes('base+"/ingredients"')&&routes.includes('scope(req,res,"canteen.manage")')],
['recipe list includes ingredient details',routes.includes('base+"/recipes"')&&routes.includes('include:{ingredients:{include:{ingredient:true}}}')],
['recipe create validates school ingredient scope',routes.includes('Ingredients must belong to this school and be active')],
['recipe update replaces composition transactionally',routes.includes('canteenRecipeIngredient.deleteMany')&&routes.includes('recipeId:existing.id')],
['admin UI ingredient and recipe controls wired',ui.includes("call('/ingredients')")&&ui.includes("call('/recipes')")&&ui.includes('Create recipe')],
['migration tables and composite foreign keys',migration.includes('CREATE TABLE "CanteenRecipe"')&&migration.includes('CanteenRecipeIngredient_recipe_scope_fkey')&&migration.includes('CanteenRecipeIngredient_ingredient_scope_fkey')],
];
for(const [name,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${name}`);
const passed=checks.filter(x=>x[1]).length;
console.log(`RESULT ${passed}/${checks.length}`);
if(passed!==checks.length)process.exit(1);
