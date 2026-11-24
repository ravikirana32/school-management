import fs from 'node:fs';
const route = fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const ui = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx','utf8');
const checks = [
  ['readiness endpoint exists', route.includes('/:organizationId/:schoolId/readiness')],
  ['requires authenticated router', route.includes('schoolConfigRouter.use(authenticate)')],
  ['uses active school membership scope', route.includes('hasActiveSchoolMembership(userId, organizationId, schoolId)')],
  ['tenant context encloses readiness queries', route.includes('withTenantContext(prisma, s, async tx => {')],
  ['school profile queried by school id', route.includes('tx.schoolProfile.findUnique({ where: { schoolId: s.schoolId } })')],
  ['academic years constrained by organization and school', route.includes('organizationId: s.organizationId, schoolId: s.schoolId')],
  ['current active academic year required', route.includes('year.isCurrent && year.status === "ACTIVE"')],
  ['terms scoped to active academic year', route.includes('academicYearId: activeYear.id')],
  ['default calendar readiness evaluated', route.includes('calendars.some(calendar => calendar.isDefault)')],
  ['working day readiness evaluated', route.includes('workingDays.length >= 5 && workingDays.some(day => day.isWorkingDay)')],
  ['attendance and grading policies checked', route.includes('policy.policyKey === "attendance"') && route.includes('policy.policyKey === "grading"')],
  ['board profile readiness checked', route.includes('tx.schoolBoardProfile.findFirst') && route.includes('boardProfile?.boardKey?.trim()')],
  ['active grade levels readiness checked', route.includes('tx.gradeLevel.findMany') && route.includes('gradeLevels.length > 0')],
  ['readiness summary returned', route.includes('completeCount, totalCount: orchestratedChecks.length, percent:')],
  ['admin workspace consumes consolidated endpoint', ui.includes('read("/readiness")')],
  ['UI no longer derives completion from separate payloads', !ui.includes('const [profile, years, calendars, workingDays, policies]')]
];
let failures=0;
for (const [label, ok] of checks) { console.log(`${ok?'PASS':'FAIL'} ${label}`); if(!ok) failures++; }
console.log(`${checks.length-failures}/${checks.length} checks passed`);
if(failures) process.exit(1);
