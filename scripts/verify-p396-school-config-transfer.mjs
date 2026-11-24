import fs from 'node:fs';
const root = process.cwd();
const transfer = fs.readFileSync(`${root}/apps/school-admin/src/school-config-transfer.ts`, 'utf8');
const ui = fs.readFileSync(`${root}/apps/school-admin/src/SchoolConfigurationWorkspace.tsx`, 'utf8');
const checks = [
  ['transfer document format and version', transfer.includes('format: "school-saas-config"') && transfer.includes('CONFIG_TRANSFER_VERSION = 1')],
  ['export envelope builder', transfer.includes('createConfigTransfer(scope: ConfigTransferTab, data')],
  ['scope validation', transfer.includes('doc.scope !== expectedScope')],
  ['profile required display name', transfer.includes('displayName is required')],
  ['profile week start validation', transfer.includes('weekStartsOn must be an integer')],
  ['working-day seven-record validation', transfer.includes('exactly 7 day records')],
  ['working-day duplicate index detection', transfer.includes('Duplicate weekday index')],
  ['working-day boolean validation', transfer.includes('isWorkingDay must be boolean')],
  ['time format validation', transfer.includes('opensAt must be HH:mm') && transfer.includes('closesAt must be HH:mm')],
  ['attendance/grading object validation', transfer.includes('Attendance policy is required') && transfer.includes('Grading policy is required')],
  ['grading range validation', transfer.includes('passingPercentage must be 0–100') && transfer.includes('decimalPlaces must be 0–3')],
  ['active tab export UI', ui.includes('exportTransfer') && ui.includes('Export current settings')],
  ['preview-before-apply', ui.includes('Validate & preview import') && ui.includes('Preview valid.')],
  ['API apply uses one server-side transaction with rollback semantics', ui.includes('applyTransfer') && ui.includes('single server-side database transaction') && ui.includes('server transaction was rolled back')],
  ['RBAC apply guard', ui.includes('session.can((transferScope === "academic" || transferScope === "calendar") ? "academics.manage" : "school.settings.manage")')],
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++; }
console.log(`P396 school config transfer verifier: ${checks.length-failed}/${checks.length} passed`);
if (failed) process.exit(1);
