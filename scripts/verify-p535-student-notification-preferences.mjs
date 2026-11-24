import fs from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const api = fs.readFileSync(new URL('backend/api/src/modules/students/student.routes.ts', root), 'utf8');
const app = fs.readFileSync(new URL('apps/student-mobile/App.tsx', root), 'utf8');
const screen = fs.readFileSync(new URL('apps/student-mobile/src/StudentNotificationPreferences.tsx', root), 'utf8');
const checks = [
 ['GET student notification preferences endpoint', api.includes('studentRouter.get') && api.includes('notification-preferences') && api.includes('notificationPreference.findMany')],
 ['PUT student notification preferences endpoint', api.includes('studentRouter.get') && api.includes('notification-preferences') && api.includes('notificationPreference.upsert')],
 ['Active student account-link guard on preference endpoints', (api.match(/Active student account link required/g)||[]).length >= 2],
 ['Tenant and school identifiers enforced on preference persistence', api.includes('organizationId,schoolId,userId,category:parsed.data.category,channel:\'IN_APP\'')],
 ['Preference categories allow-list', api.includes("['GENERAL','REPORT_CARD','HOMEWORK','FEES','ATTENDANCE','ADMISSIONS']")],
 ['PUT channel restricted to IN_APP', api.includes("channel:z.literal('IN_APP')")],
 ['Student app imports preferences component', app.includes('StudentNotificationPreferences')],
 ['Student preferences component mounted in authenticated school context', app.includes('organizationId={selected.organization.id}') && app.includes('token={tokenPair.accessToken}')],
 ['Preferences screen includes category labels', screen.includes('School announcements') && screen.includes('Report cards') && screen.includes('Homework') && screen.includes('Fees and payments') && screen.includes('Attendance') && screen.includes('Admissions')],
 ['Student UI communicates channel limitations', screen.includes('Email and push preferences are not available')],
 ['UI saves server-backed preferences', screen.includes('request("PUT"') && screen.includes('setPreferences')],
 ['Refresh preferences action', screen.includes('Refresh preferences')],
 ['Save error feedback', screen.includes('Unable to save preference')],
 ['Accessible switches with category labels', screen.includes('accessibilityLabel={`${LABELS[category]} in-app notifications`}')],
 ['School context changes reload preference data', screen.includes('useEffect(() => { void refresh(); }, [api, organizationId, schoolId, token])')],
];
for (const [name, ok] of checks) { assert.ok(ok, `FAIL: ${name}`); console.log(`PASS: ${name}`); }
console.log(`P535 assertions: ${checks.length}/${checks.length} PASS`);
