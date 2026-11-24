import assert from 'node:assert/strict';
import fs from 'node:fs';
const helper=fs.readFileSync('backend/api/src/modules/notifications/notification-channel-readiness.ts','utf8');
const route=fs.readFileSync('backend/api/src/modules/report-cards/report-card.routes.ts','utf8');
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['In-app channel always available',helper.includes('IN_APP: { available: true')],
 ['Email readiness requires HTTPS provider URL',helper.includes('startsWith("https://")')],
 ['Email readiness requires token and sender',helper.includes('emailProviderToken?.trim()')&&helper.includes('emailFrom?.trim()')],
 ['Push remains unavailable explicitly',helper.includes('PUSH: { available: false')],
 ['Readiness API route exists',route.includes('/portal/notification-channels')],
 ['Route is permission scoped',route.includes('scope(req,res,"parent.reports.read")')],
 ['Parent app fetches readiness API',app.includes('/portal/notification-channels')],
 ['Parent app renders dynamic email availability',app.includes('notificationChannels.EMAIL?.available')]
];
for(const [name,ok] of checks)assert.ok(ok,`FAILED: ${name}`);
console.log(`P289 channel readiness verifier: ${checks.length}/${checks.length} PASS`);
