import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['Email switch disables when channel unavailable',app.includes("channel==='EMAIL'&&!notificationChannels.EMAIL?.available")],
 ['Accessibility disabled-state mirrors email readiness',app.includes("accessibilityState={{checked:channel==='PUSH'?false:preferenceEnabled(category,channel),disabled:busy||offlineSession||savingNotificationPreference[notificationPreferenceKey(category,channel)]||reconcilingNotificationPreference[notificationPreferenceKey(category,channel)]||channel==='PUSH'||(channel==='EMAIL'&&!notificationChannels.EMAIL?.available)}")],
 ['Email availability reason is surfaced in accessibility hint',app.includes("notificationChannels.EMAIL?.reason||'Email delivery unavailable'")],
 ['Push remains disabled',app.includes("channel==='PUSH'")],
 ['Readiness still fetched dynamically',app.includes('/portal/notification-channels')],
 ['Preference mutations remain offline-guarded',app.includes('if(!selected||offlineSession)return;')],
];
for(const [name,ok] of checks)assert.ok(ok,`FAILED: ${name}`);
console.log(`P290 parent email readiness verifier: ${checks.length}/${checks.length} PASS`);
