import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['Refresh handler is school-scoped',app.includes('refreshNotificationChannelReadiness=useCallback(async()=>{if(!selected')&&app.includes('/portal/notification-channels')],
 ['Refresh handler blocks offline and duplicate refreshes',app.includes('offlineSession||refreshingNotificationChannels')],
 ['Refresh loading state is restored in finally',app.includes('finally{setRefreshingNotificationChannels(false);}')],
 ['Refresh button is accessible',app.includes('accessibilityLabel=\"Refresh notification channel availability\"')],
 ['Refresh button has explicit disabled state',app.includes('disabled={offlineSession||refreshingNotificationChannels}')],
 ['Button displays progress and result feedback',app.includes('Refreshing channel availability…')&&app.includes('Notification channel availability refreshed from your school.')],
];
for(const [name,ok] of checks)assert.ok(ok,`FAILED: ${name}`);
console.log(`P291 channel readiness refresh verifier: ${checks.length}/${checks.length} PASS`);
