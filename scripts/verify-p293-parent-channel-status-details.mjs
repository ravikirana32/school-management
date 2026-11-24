import fs from 'node:fs';
const source=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['notification preference section remains present',source.includes('Notification preferences')],
 ['manual readiness refresh control remains',source.includes('Refresh channel availability')],
 ['email readiness uses API availability',source.includes('notificationChannels.EMAIL?.available')],
 ['email unavailable reason surfaced to user',source.includes("notificationChannels.EMAIL?.reason||'Email delivery is not configured'")],
 ['email available label is explicit',source.includes('Configured by your school')],
 ['push readiness reason surfaced to user',source.includes("notificationChannels.PUSH?.reason||'Push delivery is not available yet'")],
 ['push remains disabled',source.includes("channel==='PUSH'||")],
 ['offline guard retained',source.includes('offlineSession||refreshingNotificationChannels')]
];
let failed=0; for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
console.log(`${checks.length-failed}/${checks.length} passed`); if(failed)process.exit(1);
