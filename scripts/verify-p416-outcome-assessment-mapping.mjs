import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const schema = fs.readFileSync(path.join(root, 'backend/api/prisma/schema.prisma'), 'utf8');
const routes = fs.readFileSync(path.join(root, 'backend/api/src/modules/curriculum/curriculum.routes.ts'), 'utf8');
const helper = fs.readFileSync(path.join(root, 'backend/api/src/modules/curriculum/outcome-assessment-mapping.ts'), 'utf8');
const tests = fs.readFileSync(path.join(root, 'backend/api/src/modules/curriculum/outcome-assessment-mapping.test.ts'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'apps/school-admin/src/CurriculumOutcomesWorkspace.tsx'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'backend/api/prisma/migrations/20261121170000_p416_curriculum_outcome_assessment_mapping/migration.sql'), 'utf8');
const checks = [
  ['Prisma mapping model exists', schema.includes('model CurriculumOutcomeAssessmentMapping {')],
  ['Mapping has tenant organization and school fields', /model CurriculumOutcomeAssessmentMapping[\s\S]*?organizationId String[\s\S]*?schoolId String/.test(schema)],
  ['Mapping unique constraint outcome-exam pair', /@@unique\(\[schoolId, outcomeId, examId\]\)/.test(schema)],
  ['Mapping has outcome and exam indexes', /@@index\(\[organizationId, schoolId, outcomeId\]\)/.test(schema) && /@@index\(\[organizationId, schoolId, examId\]\)/.test(schema)],
  ['Migration adds outcome tenant composite unique', migration.includes('CurriculumOutcome_id_org_school_key')],
  ['Migration enforces school FK', migration.includes('CurriculumOutcomeAssessmentMapping_school_org_fkey')],
  ['Migration enforces outcome tenant scope FK', migration.includes('CurriculumOutcomeAssessmentMapping_outcome_scope_fkey')],
  ['Migration enforces exam tenant scope FK', migration.includes('CurriculumOutcomeAssessmentMapping_exam_scope_fkey')],
  ['Migration preserves creator reference', migration.includes('CurriculumOutcomeAssessmentMapping_creator_fkey')],
  ['Migration duplicate mapping index', migration.includes('CurriculumOutcomeAssessmentMapping_school_outcome_exam_key')],
  ['Mapping RLS enabled and forced', migration.includes('ENABLE ROW LEVEL SECURITY') && migration.includes('FORCE ROW LEVEL SECURITY')],
  ['Mapping RLS tenant policy restricts both org and school', /curriculumoutcomeassessmentmapping_tenant_isolation[\s\S]*app\.current_organization_id[\s\S]*app\.current_school_id/.test(migration)],
  ['List endpoint is authenticated through router middleware', routes.includes('curriculumRouter.use(authenticate)') && routes.includes('/outcomes/:outcomeId/assessment-mappings')],
  ['List endpoint requires read scope', routes.includes('const s = await scope(req, res); if (!s) return;')],
  ['Create mapping requires academics.manage and entitlement', routes.includes('outcomes/:outcomeId/assessment-mappings", asyncRoute(async (req, res)') && routes.includes('if (!await entitlement(s.organizationId, s.schoolId))')],
  ['Create mapping validates exam id', routes.includes('examId is required')],
  ['Create mapping checks school-owned outcome and exam', routes.includes('curriculumOutcome.findFirst') && routes.includes('schoolAssessmentExam.findFirst')],
  ['Alignment helper validates grade match', helper.includes('Outcome and exam must target the same grade')],
  ['Alignment helper validates subject name/code', helper.includes('Outcome subject must match the exam subject name or code')],
  ['Duplicate mapping conflict handling', routes.includes('This outcome is already mapped to the selected exam')],
  ['Mapping delete is school-scoped', routes.includes('assessment-mappings/:mappingId') && routes.includes('organizationId: s.organizationId, schoolId: s.schoolId')],
  ['UI exposes mapping panel', ui.includes('Outcome ↔ assessment alignment')],
  ['UI filters compatible exams by grade', ui.includes('String(e.gradeLevelId) === String(selectedOutcome?.gradeLevelId)')],
  ['UI subject matching restricts subject outcomes', ui.includes('subject.name') && ui.includes('subject.code')],
  ['UI supports adding and removing mappings', ui.includes('Add mapping') && ui.includes('Remove mapping')],
  ['Unit tests cover alignment scenarios', tests.includes('case-insensitively') && tests.includes('grade mismatches') && tests.includes('subject mismatch')],
];
let passed = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (ok) passed++; }
console.log(`P416 verifier: ${passed}/${checks.length} PASS`);
if (passed !== checks.length) process.exit(1);
