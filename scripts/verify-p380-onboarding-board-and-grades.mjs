import fs from 'node:fs';
const api = fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts', 'utf8');
const ui = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const checks = [
  ['readiness loads board profile for tenant school', api.includes('tx.schoolBoardProfile.findFirst({ where: { organizationId: s.organizationId, schoolId: s.schoolId } })')],
  ['board profile completion requires board key and name', api.includes('boardProfile?.boardKey?.trim() && boardProfile?.boardName?.trim()')],
  ['readiness loads active school grade levels', api.includes('tx.gradeLevel.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, isActive: true } })')],
  ['grade-level readiness requires at least one active grade', api.includes('complete: gradeLevels.length > 0')],
  ['board setup remediation points to curriculum workspace', api.includes('Open Board & curriculum and save the school\'s board affiliation.')],
  ['grade setup remediation points to curriculum workspace', api.includes('Open Board & curriculum and create the school’s grade or level list.')],
  ['board-profile is a persisted onboarding step', api.includes('"board-profile"') && ui.includes('"board-profile"')],
  ['grade-levels is a persisted onboarding step', api.includes('"grade-levels"') && ui.includes('"grade-levels"')],
  ['board-profile depends on school identity', ui.includes('prerequisites("board-profile", ["profile"])')],
  ['grade levels depend on board profile', ui.includes('prerequisites("grade-levels", ["board-profile"])')],
  ['curriculum workspace is the configuration navigation target', ui.includes('actionTab: "curriculum"')],
  ['grading policy depends on active year and grade configuration', ui.includes('prerequisites("grading-policy", ["profile", "academic-year", "grade-levels"])')],
  ['server resume step lookup includes the current eleven steps', ui.includes('["profile", "board-profile", "academic-year", "terms", "grade-levels", "rooms", "fee-structures", "calendar", "working-days", "attendance-policy", "grading-policy"]')],
];
let failures=0;
for (const [label, ok] of checks) { console.log(`${ok?'PASS':'FAIL'} ${label}`); if(!ok) failures++; }
console.log(`${checks.length-failures}/${checks.length} checks passed`);
if(failures) process.exit(1);
