import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const routes=fs.readFileSync(path.join(root,'backend/api/src/modules/platform/platform.routes.ts'),'utf8');
const worker=fs.readFileSync(path.join(root,'backend/api/src/workers/document-scan-worker.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/super-admin/src/main.tsx'),'utf8');
const pkg=fs.readFileSync(path.join(root,'backend/api/package.json'),'utf8');
const checks=[
 ['GET channel preferences endpoint',routes.includes('get("/operations-alert-channel-preferences"')],
 ['PUT channel preferences endpoint',routes.includes('put("/operations-alert-channel-preferences"')],
 ['Defaults WEBHOOK channel',routes.includes('defaultChannels: ["WEBHOOK"]')],
 ['Allowed channel whitelist',routes.includes('["IN_APP", "EMAIL", "WEBHOOK"]')],
 ['Preference count bounded',routes.includes('userPreferences.length > 500')],
 ['Default channel must include active WEBHOOK',routes.includes('defaultChannels.includes')&&routes.includes('Default channels must include WEBHOOK')],
 ['Preference recipient uniqueness',routes.includes('seen.has(item.userId.trim())')],
 ['Recipient may opt out with empty channel list',routes.includes('channels.length > 0')&&routes.includes('be empty to opt out')],
 ['Preference recipient validation against active platform admins',routes.includes('isPlatformAdmin: true, isActive: true')],
 ['Preferences persisted via platform setting',routes.includes('operations_alert_channel_preferences')&&routes.includes('platformControlSetting.upsert')],
 ['Preference changes audited',routes.includes('platform.operations_alert_channel_preferences.updated')],
 ['Worker reads channel preferences',worker.includes('operations_alert_channel_preferences')],
 ['Worker defaults to webhook channel',worker.includes('defaultChannels:["WEBHOOK"]')||worker.includes('["WEBHOOK"]')],
 ['Webhook delivery obeys channel preference',worker.includes('channelsFor(userId).includes("WEBHOOK")')],
 ['Recipient payload exposes preferred channels',worker.includes('preferredChannels:channelsFor(recipientUserId)')],
 ['Super Admin loads channel preferences',ui.includes('call("/operations-alert-channel-preferences")')],
 ['Super Admin edits channel preferences',ui.includes('Edit channel preferences JSON')&&ui.includes('setAlertChannelPreferences(result.preferences)')],
 ['Verifier package script registered',pkg.includes('verify:p451')]
];
let failures=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failures++;}console.log(`P451 verifier: ${checks.length-failures}/${checks.length} PASS`);process.exit(failures?1:0);
