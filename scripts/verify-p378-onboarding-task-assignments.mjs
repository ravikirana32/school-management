import fs from 'node:fs';
const api = fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts', 'utf8');
const schema = fs.readFileSync('backend/api/prisma/schema.prisma', 'utf8');
const migration = fs.readFileSync('backend/api/prisma/migrations/20261121110000_p378_onboarding_task_assignments/migration.sql', 'utf8');
const ui = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const checks = [
  ['task assignment persistence model', schema.includes('model SchoolOnboardingTaskAssignment')],
  ['assignment unique per tenant-school-task', schema.includes('@@unique([organizationId, schoolId, taskKey])')],
  ['assignment assignee index', schema.includes('@@index([organizationId, schoolId, assignedToUserId])')],
  ['SQL table migration exists', migration.includes('CREATE TABLE IF NOT EXISTS "SchoolOnboardingTaskAssignment"')],
  ['SQL tenant-school-task unique index', migration.includes('organizationId", "schoolId", "taskKey')],
  ['assignment roster GET endpoint', api.includes('/:organizationId/:schoolId/onboarding-assignments') && api.includes('schoolMembership.findMany')],
  ['assignment write endpoint', api.includes('/onboarding-assignments/:taskKey') && api.includes('schoolOnboardingTaskAssignment.upsert')],
  ['assignment task allowlist', api.includes('onboardingTaskKeys.includes(taskKey as any)')],
  ['assignee must be active school member', api.includes('Assignee must be an active member of this school')],
  ['assignment permission gate', api.includes('requirePermission(s, res, "school.settings.manage")')],
  ['audit event for assignment change', api.includes('school.onboarding.assignment.updated')],
  ['audit event for assignment removal', api.includes('school.onboarding.assignment.removed')],
  ['admin loads assignments and member roster', ui.includes('read("/onboarding-assignments")') && ui.includes('setAssignmentMembers')],
  ['admin assignment selector exists', ui.includes('onboarding-owner-${item.key}') && ui.includes('saveAssignment(item.key')],
  ['admin sends assignment write request', ui.includes('onboarding-assignments/${encodeURIComponent(taskKey)}') && ui.includes('assignedToUserId: assignedToUserId || null')],
  ['assignment task list derives from eleven onboarding steps', api.includes("\"grade-levels\"") && api.includes("\"board-profile\"") && api.includes("\"rooms\"") && api.includes("\"fee-structures\"")],
  ['assignment save feedback exists', ui.includes('savingAssignments[item.key]') && ui.includes('Assignment save failed')],
  ['RLS enabled and forced for task assignments', migration.includes('ALTER TABLE \"SchoolOnboardingTaskAssignment\" ENABLE ROW LEVEL SECURITY') && migration.includes('FORCE ROW LEVEL SECURITY')],
  ['tenant RLS policy for task assignments', migration.includes('SchoolOnboardingTaskAssignment_tenant_policy') && migration.includes('app.current_organization_id') && migration.includes('app.current_school_id')],
  ['P377 progress table RLS retrofit', migration.includes('SchoolOnboardingProgress_tenant_policy') && migration.includes('ALTER TABLE \"SchoolOnboardingProgress\" ENABLE ROW LEVEL SECURITY')],
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++; }
console.log(`${checks.length - failed}/${checks.length} checks passed`);
if (failed) process.exit(1);
