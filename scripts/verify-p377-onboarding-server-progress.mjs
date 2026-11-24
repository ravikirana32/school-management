import fs from 'node:fs';
const api = fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts', 'utf8');
const schema = fs.readFileSync('backend/api/prisma/schema.prisma', 'utf8');
const migration = fs.readFileSync('backend/api/prisma/migrations/20261120200000_p377_school_onboarding_progress/migration.sql', 'utf8');
const ui = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const checks = [
  ['progress persistence model exists', schema.includes('model SchoolOnboardingProgress')],
  ['tenant-school unique key', schema.includes('@@unique([organizationId, schoolId])')],
  ['tenant-school SQL unique index', migration.includes('SchoolOnboardingProgress_organizationId_schoolId_key')],
  ['progress GET route', api.includes('/:organizationId/:schoolId/onboarding-progress') && api.includes('schoolOnboardingProgress.findUnique')],
  ['progress PUT route', api.includes('schoolOnboardingProgress.upsert')],
  ['active school membership enforced', api.includes('const s = await scope(req, res); if (!s) return;')],
  ['permission gate on write', api.includes('requirePermission(s, res, "school.settings.manage")')],
  ['step allowlist validation', api.includes('onboardingStepKeys.includes(currentStepKey as any)')],
  ['saved step attributed to user', api.includes('lastSavedBy: s.userId')],
  ['admin fetches server resume position', ui.includes('read("/onboarding-progress")')],
  ['admin writes current step position', ui.includes('method: "PUT"') && ui.includes('currentStepKey: currentStep.key')],
  ['local fallback retained', ui.includes('Local resume fallback remains active')],
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++; }
console.log(`${checks.length - failed}/${checks.length} checks passed`);
if (failed) process.exit(1);
