import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const schema = fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8');
const migration = fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261121180000_p418_curriculum_lesson_planning/migration.sql'),'utf8');
const routes = fs.readFileSync(path.join(root,'backend/api/src/modules/curriculum/curriculum.routes.ts'),'utf8');
const ui = fs.readFileSync(path.join(root,'apps/school-admin/src/CurriculumLessonPlanning.tsx'),'utf8');
const workspace = fs.readFileSync(path.join(root,'apps/school-admin/src/CurriculumOutcomesWorkspace.tsx'),'utf8');
const checks = [
 ['Lesson plan model defined', schema.includes('model CurriculumLessonPlan {')],
 ['Outcome link model defined', schema.includes('model CurriculumLessonPlanOutcome {')],
 ['Status lifecycle persisted', migration.includes("'DRAFT','PLANNED','COMPLETED','ARCHIVED'")],
 ['Tenant RLS forced on plans', migration.includes('FORCE ROW LEVEL SECURITY') && migration.includes('curriculumlessonplan_tenant_isolation')],
 ['Tenant RLS forced on outcome links', migration.includes('curriculumlessonplanoutcome_tenant_isolation')],
 ['Composite plan/outcome scope FK', migration.includes('CurriculumLessonPlanOutcome_plan_scope_fkey') && migration.includes('CurriculumLessonPlanOutcome_outcome_scope_fkey')],
 ['Version-scoped plan listing API', routes.includes('/versions/:versionId/lesson-plans')],
 ['Create lesson plan API', routes.includes('curriculumLessonPlan.create')],
 ['Edit lesson plan API', routes.includes('curriculumLessonPlan.update')],
 ['Draft-only delete guard', routes.includes('plan.status !== "DRAFT"')],
 ['Management permission enforced', routes.includes('scope(req, res, "academics.manage")')],
 ['Entitlement guard present', routes.includes('Curriculum configuration is not included in the active subscription')],
 ['Outcome grade/version validation', routes.includes('curriculumVersionId: version.id, gradeLevelId: grade.id')],
 ['UI lesson planner component', ui.includes('Create lesson plan') && ui.includes('Linked curriculum outcomes')],
 ['UI status lifecycle', ui.includes('COMPLETED') && ui.includes('ARCHIVED')],
 ['UI component integrated', workspace.includes('<CurriculumLessonPlanning')],
 ['Lesson objective field', ui.includes('Learning objectives')],
 ['Teaching resources field', ui.includes('Teaching resources')],
 ['Date/duration fields', ui.includes('Planned date') && ui.includes('Duration (minutes)')],
 ['Version/school scoping in route filters', routes.includes('organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id')],
 ['Create validates subject ownership', routes.includes('curriculumVersionId: version.id, gradeLevelId: grade.id')],
 ['Outcome links persisted on create and edit', routes.includes('curriculumLessonPlanOutcome.createMany') && routes.includes('curriculumLessonPlanOutcome.deleteMany')],
 ['Delete response is explicit', routes.includes('data: { deleted: true }')],
 ['Verify script registered in API package', fs.readFileSync(path.join(root,'backend/api/package.json'),'utf8').includes('verify:p418')],
];
for (const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
console.log(`${checks.filter(x=>x[1]).length}/${checks.length} checks passed`);
if (checks.some(x=>!x[1])) process.exit(1);
