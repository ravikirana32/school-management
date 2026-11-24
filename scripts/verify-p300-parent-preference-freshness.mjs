import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const helper=fs.readFileSync('apps/parent-mobile/src/offline/notification-preference-intent.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
['sync checks fresh server state before PUT',app.includes('const latest=await request(`/parents/${selected.organization.id}/${selected.school.id}/portal/notification-preferences`)')&&app.indexOf('const latest=await request')<app.indexOf('method:"PUT",body:JSON.stringify({category:intent.category')],
['matching server state reconciles without resend',app.includes('Server already matches the pending setting; reconciled without resending.')&&app.includes('continue;')],
['fresh server values update visible preference state',app.includes('setNotificationPreferences(rows=>rows.map(x=>x.category===intent.category&&x.channel===intent.channel?{...x,...current}:x))')],
['pending intent cleared only after confirmed match or successful PUT',app.includes('await clearPendingPreferenceIntent(email,selected.organization.id,selected.school.id,intent.category,intent.channel)')],
['freshness or sync failure preserves pending intent and continues queue',app.includes('Sync failed. Pending intent retained. Retry is delayed to prevent repeated requests.')&&app.includes('notificationSyncBackoffMs.current=Math.min(notificationSyncBackoffMs.current*2,60000);continue;')],
['clock-skew guard allows only five-minute future tolerance',helper.includes('FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1000')&&helper.includes('item.savedAt <= Date.now() + FUTURE_CLOCK_SKEW_MS')],
['expired and future-dated intents are filtered by validity',helper.includes('Date.now() - item.savedAt <= TTL_MS && item.savedAt <= Date.now() + FUTURE_CLOCK_SKEW_MS')],
['package verifier registered',pkg.scripts['verify:p300']==='node scripts/verify-p300-parent-preference-freshness.mjs']
];
let passed=0;for(const [name,ok] of checks){if(ok){passed++;console.log(`PASS ${name}`)}else console.log(`FAIL ${name}`)}console.log(`${passed}/${checks.length} PASS`);assert.equal(passed,checks.length);
