import { readFileSync } from 'node:fs';
const files = {
  publicRoutes: readFileSync('backend/api/src/modules/admissions/admission.public.routes.ts', 'utf8'),
  adminRoutes: readFileSync('backend/api/src/modules/admissions/admission.routes.ts', 'utf8'),
  portal: readFileSync('apps/public-portal/src/main.tsx', 'utf8'),
  adminUi: readFileSync('apps/school-admin/src/AdmissionsWorkspace.tsx', 'utf8'),
  register: readFileSync('MASTER-OPEN-GAPS-REGISTER.md', 'utf8'),
  report: readFileSync('P210-DELIVERY-REPORT.md', 'utf8'),
};
const checks = [
  ['SMS request disabled with HTTP 410', files.publicRoutes.includes('p.data.channel==="SMS"') && files.publicRoutes.includes('status(410)') && files.publicRoutes.includes('ADMISSIONS_SMS_OTP_DEFERRED')],
  ['SMS verify disabled with HTTP 410', (files.publicRoutes.match(/p\.data\.channel==="SMS"/g)||[]).length >= 2],
  ['Phone verification no longer gates public submission', !files.publicRoutes.includes('ADMISSIONS_PHONE_VERIFICATION_REQUIRED') && !files.publicRoutes.includes('requirePhone&&')],
  ['Applicant portal email-only UI', files.portal.includes('useState<"EMAIL">("EMAIL")') && !files.portal.includes('option value="SMS"')],
  ['School admin UI no phone policy toggle', !files.adminUi.includes('requirePhoneVerification,setRequirePhoneVerification') && !files.adminUi.includes('Require phone/SMS verification')],
  ['Legacy phone policy forced off by API', files.adminRoutes.includes('requirePhoneVerification:false')],
  ['P210 gap register and report included', files.register.includes('P210-G001') && files.report.includes('P210 Delivery Report')],
];
let failed = false;
for (const [name, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); failed ||= !pass; }
if (failed) process.exit(1);
console.log(`P210 source verification: ${checks.length}/${checks.length} checks passed`);
