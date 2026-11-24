import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['React Native AppState imported',app.includes('AppState, SafeAreaView')],
 ['Readiness refresh is memoized',app.includes('refreshNotificationChannelReadiness=useCallback(async()=>')],
 ['Foreground lifecycle listener registered',app.includes('AppState.addEventListener("change"')],
 ['Foreground refresh only occurs when app becomes active',app.includes('state==="active"&&selected&&!offlineSession')],
 ['Lifecycle listener cleans up subscription',app.includes('return()=>subscription.remove();')],
 ['Manual refresh control remains accessible',app.includes('accessibilityLabel=\"Refresh notification channel availability\"')],
 ['Refresh retains duplicate/offline guards',app.includes('if(!selected||offlineSession||refreshingNotificationChannels)return;')],
];
for(const [name,ok] of checks)assert.ok(ok,`FAILED: ${name}`);
console.log(`P292 foreground readiness refresh verifier: ${checks.length}/${checks.length} PASS`);
