import fs from 'node:fs';
const root=process.cwd();
const routes=fs.readFileSync(`${root}/backend/api/src/modules/curriculum/curriculum.routes.ts`,'utf8');
const helper=fs.readFileSync(`${root}/backend/api/src/modules/curriculum/outcome-coverage.ts`,'utf8');
const ui=fs.readFileSync(`${root}/apps/school-admin/src/CurriculumOutcomesWorkspace.tsx`,'utf8');
const test=fs.readFileSync(`${root}/scripts/test-p417-outcome-coverage-smoke.mjs`,'utf8');
const checks=[
['coverage helper exports dashboard builder',helper.includes('export function buildOutcomeCoverageDashboard')],
['dashboard summary calculates mapped and unmapped outcomes',helper.includes('mappedOutcomes: mappedOutcomes.length')&&helper.includes('unmappedOutcomes: unmappedOutcomes.length')],
['coverage percentage calculated safely for empty outcomes',helper.includes('outcomes.length ? Math.round')],
['grade-level breakdown present',helper.includes('const byGrade =')&&helper.includes('gradeLevelId')],
['subject-level breakdown present',helper.includes('const bySubject =')&&helper.includes('subjectOutcomes')],
['exam-level alignment breakdown present',helper.includes('const byExam =')&&helper.includes('eligibleOutcomeCount')],
['unmapped action-list records include outcome details',helper.includes('const unmappedDetails =')&&helper.includes('reviewStatus: o.reviewStatus')],
['multi-mapped outcome details exposed',helper.includes('const multiMappedDetails =')&&helper.includes('mappingCount: mappingCountByOutcome')],
['dashboard endpoint is version-scoped',routes.includes('outcome-assessment-coverage')&&routes.includes('curriculumVersion.findFirst')],
['dashboard endpoint validates review status',routes.includes('Invalid review status filter')],
['dashboard endpoint supports grade and subject filters',routes.includes('req.query.gradeLevelId')&&routes.includes('req.query.curriculumSubjectId')],
['dashboard outcomes filtered by school and version',routes.includes('curriculumOutcome.findMany')&&routes.includes('curriculumVersionId: version.id')],
['dashboard mappings restricted to filtered outcome ids',routes.includes('outcomeId: { in: outcomes.map')],
['exam records restricted to tenant, school, grade and curriculum year',routes.includes('schoolAssessmentExam.findMany')&&routes.includes('gradeLevelId: { in: gradeIdsForExams }')&&routes.includes('...(version.academicYearId ? { academicYearId: version.academicYearId } : {})')],
['dashboard includes exams with zero mappings',helper.includes('const byExam = exams.map(exam =>')&&helper.includes('mappedOutcomeCount: mapped.length')],
['UI dashboard integrated into outcomes workspace',ui.includes('<OutcomeCoverageDashboard versionId={selectedVersion}')],
['UI provides grade and review filters',ui.includes('gradeFilter={filterGrade}')&&ui.includes('reviewFilter={filterStatus}')],
['UI exposes coverage KPI cards',ui.includes('Total outcomes')&&ui.includes('Coverage')&&ui.includes('Mapped')],
['UI includes grade-wise coverage',ui.includes('Grade-wise coverage')],
['UI includes subject-wise coverage',ui.includes('Subject-wise coverage')],
['UI includes exam-wise alignment',ui.includes('Exam-wise alignment')],
['UI includes unmapped action list',ui.includes('Unmapped outcomes — action list')],
['UI includes multi-mapped outcome reporting',ui.includes('Outcomes mapped to multiple exams')],
['smoke suite covers empty dashboard and breakdowns',test.includes('empty input safely reports zero coverage')&&test.includes('grade rows report coverage and exams')&&test.includes('exam rows include mapped and eligible counts')&&test.includes('exam without mappings is included')],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}
console.log(`P417 verifier: ${pass}/${checks.length} PASS`);if(pass!==checks.length)process.exit(1);
