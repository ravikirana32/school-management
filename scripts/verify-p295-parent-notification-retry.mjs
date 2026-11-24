import fs from 'node:fs';
const source=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['retry intent state retained per preference',source.includes('retryNotificationPreference')],
 ['retry intent cleared after successful save',source.includes('delete next[key]')],
 ['failed save retains intended enabled value',source.includes('[key]:enabled')],
 ['retry targets same category/channel',source.includes('updateNotificationPreference(category,channel,retryNotificationPreference')],
 ['retry control has accessible button role',source.includes('accessibilityRole="button"')],
 ['retry label includes category and channel',source.includes('Retry ${category.replaceAll')],
 ['offline and duplicate retry guards preserved',source.includes('disabled={offlineSession||savingNotificationPreference[notificationPreferenceKey(category,channel)]')],
 ['retrying state text present',source.includes('Retrying…')],
 ['save endpoint remains PUT',source.includes("method:'PUT'")],
 ['offline mutation guard preserved',source.includes('if(!selected||offlineSession)return;')]
];
let failed=0; for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
console.log(`${checks.length-failed}/${checks.length} passed`); if(failed)process.exit(1);
