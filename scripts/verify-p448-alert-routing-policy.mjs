import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');const routes=fs.readFileSync(path.join(root,'backend/api/src/modules/platform/platform.routes.ts'),'utf8');const ui=fs.readFileSync(path.join(root,'apps/super-admin/src/main.tsx'),'utf8');const checks=[
['GET policy endpoint',routes.includes('platformRouter.get("/operations-alert-policy"')],
['PUT policy endpoint',routes.includes('platformRouter.put("/operations-alert-policy"')],
['Defaults cover all severities', ['INFO','WARNING','ERROR','CRITICAL'].every(x=>routes.includes(`${x}: { recipientUserIds:`))],
['Policy requires enabled flag',routes.includes('typeof policy.enabled !== "boolean"')],
['Reminder bounds validated',routes.includes('rule.reminderMinutes < 1 || rule.reminderMinutes > 1440')],
['Escalation bounds validated',routes.includes('rule.escalationMinutes < 1 || rule.escalationMinutes > 10080')],
['Recipient count capped',routes.includes('rule.recipientUserIds.length > 100')],
['Recipients must be active platform admins',routes.includes('isPlatformAdmin: true, isActive: true')&&routes.includes('Recipients must be active platform administrators')],
['Recipient ids normalized and deduplicated',routes.includes('new Set(rule.recipientUserIds.map((id:string)=>id.trim()))')],
['Policy persisted to PlatformControlSetting',routes.includes('key: "operations_alert_policy"')&&routes.includes('platformControlSetting.upsert')],
['Policy updates audited',routes.includes('platform.operations_alert_policy.updated')],
['Super Admin loads policy',ui.includes('call("/operations-alert-policy")')],
['Super Admin exposes policy editor',ui.includes('Edit policy JSON')&&ui.includes('editAlertPolicy')],
['Super Admin refresh action',ui.includes('Refresh policy')]
];let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}console.log(`P448 verifier: ${checks.length-failed}/${checks.length} PASS`);process.exit(failed?1:0);
