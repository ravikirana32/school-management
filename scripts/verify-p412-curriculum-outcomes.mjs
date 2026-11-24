import fs from 'node:fs';
import assert from 'node:assert/strict';
const root = process.cwd();
const read = p => fs.readFileSync(`${root}/${p}`, 'utf8');
const schema = read('backend/api/prisma/schema.prisma');
const migration = read('backend/api/prisma/migrations/20261121160000_p412_curriculum_outcomes/migration.sql');
const routes = read('backend/api/src/modules/curriculum/curriculum.routes.ts');
const zod = read('backend/api/src/modules/curriculum/curriculum.schemas.ts');
const lifecycle = read('backend/api/src/modules/curriculum/outcome-review.ts');
const tests = read('backend/api/src/modules/curriculum/outcome-review.test.ts');
const checks = [
  ['Outcome model present', schema.includes('model CurriculumOutcome {')],
  ['Review status enum present', schema.includes('enum CurriculumOutcomeReviewStatus')],
  ['Version/grade scoped unique outcome code', schema.includes('@@unique([schoolId, curriculumVersionId, gradeLevelId, code])')],
  ['Outcome review status default', schema.includes('reviewStatus CurriculumOutcomeReviewStatus @default(DRAFT)')],
  ['Source provenance fields present', ['sourceReference String?', 'sourceEdition String?', 'sourceUrl String?', 'provenanceNote String'].every(x=>schema.includes(x))],
  ['Migration creates review enum and table', migration.includes('CREATE TYPE "CurriculumOutcomeReviewStatus"') && migration.includes('CREATE TABLE "CurriculumOutcome"')],
  ['Migration has tenant isolation RLS', migration.includes('ENABLE ROW LEVEL SECURITY') && migration.includes('curriculumoutcome_school_tenant_isolation')],
  ['Migration enforces version, grade, subject FKs', ['CurriculumOutcome_version_school_fkey','CurriculumOutcome_grade_school_fkey','CurriculumOutcome_subject_school_fkey'].every(x=>migration.includes(x))],
  ['Migration approved-state consistency check', migration.includes('CurriculumOutcome_review_consistency_check')],
  ['Migration has correctly quoted review enum column', migration.includes('"reviewStatus" "CurriculumOutcomeReviewStatus"') && !migration.includes('reviewStatus"CurriculumOutcomeReviewStatus')],
  ['Outcome creation schema validates title/code/provenance', ['curriculumOutcomeSchema','title: z.string().trim().min(3)','provenanceNote: z.string().trim().min(3)'].every(x=>zod.includes(x))],
  ['Outcome list endpoint version scoped', routes.includes('/:organizationId/:schoolId/versions/:versionId/outcomes') && routes.includes('curriculumOutcome.findMany')],
  ['Outcome create endpoint permission guarded', routes.includes('curriculumOutcome.create') && routes.includes('!(await admin(s, res)))')],
  ['Subject must match version and grade', routes.includes('curriculumVersionId: version.id, gradeLevelId: grade.id')],
  ['Review endpoint exists and handles invalid transitions', routes.includes('/outcomes/:outcomeId/review') && routes.includes('invalidTransition')],
  ['Lifecycle helper restricts draft direct approval', lifecycle.includes('DRAFT: ["IN_REVIEW", "ARCHIVED"]')],
  ['Unit tests cover lifecycle', tests.includes('describe("P412 curriculum outcome review transitions"') && (tests.match(/it\(/g)||[]).length >= 5],
];
let passed=0;
for (const [name,ok] of checks) { if(ok) passed++; console.log(`${ok?'PASS':'FAIL'} ${name}`); }
console.log(`P412 verifier: ${passed}/${checks.length} PASS`);
if (passed !== checks.length) process.exitCode=1;
