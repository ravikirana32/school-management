import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
const root=process.cwd();
const require=createRequire('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/bin/tsc');
const ts=require('typescript');
const files=[
 'apps/staff-mobile/src/health/health-api.ts',
 'apps/staff-mobile/src/health/HealthMobilePanel.tsx',
 'apps/parent-mobile/src/health/health-api.ts',
 'apps/parent-mobile/src/health/ParentHealthScreen.tsx'
];
let failures=0,passes=0;
function check(label,ok){if(ok){passes++;console.log(`PASS ${label}`)}else{failures++;console.error(`FAIL ${label}`)}}
for(const f of files){const full=path.join(root,f);check(`${f} exists`,fs.existsSync(full));if(!fs.existsSync(full))continue;const source=fs.readFileSync(full,'utf8');const sf=ts.createSourceFile(f,source,ts.ScriptTarget.Latest,true,f.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);check(`${f} parses without syntax diagnostics`,sf.parseDiagnostics.length===0);if(sf.parseDiagnostics.length)for(const d of sf.parseDiagnostics)console.error(ts.flattenDiagnosticMessageText(d.messageText,'\n'));}
const staffApi=fs.readFileSync(path.join(root,files[0]),'utf8');
const staffPanel=fs.readFileSync(path.join(root,files[1]),'utf8');
const parentPanel=fs.readFileSync(path.join(root,files[3]),'utf8');
check('Staff-mobile API helper includes cases and follow-ups',staffApi.includes('getHealthCases')&&staffApi.includes('addHealthCaseFollowUp'));
check('Staff-mobile API helper includes incident list, acknowledge, escalate, update',staffApi.includes('getHealthIncidents')&&staffApi.includes('acknowledgeHealthIncident')&&staffApi.includes('escalateHealthIncident')&&staffApi.includes('updateHealthIncident'));
check('Staff panel integrates case workflow actions',staffPanel.includes('IN_PROGRESS')&&staffPanel.includes('WAITING')&&staffPanel.includes('Add follow-up'));
check('Staff panel integrates incident acknowledgement/escalation/resolution',staffPanel.includes('Acknowledge')&&staffPanel.includes('Escalate')&&staffPanel.includes('Resolve'));
check('Incident report filters include status and severity',staffPanel.includes('incidentStatus')&&staffPanel.includes('incidentSeverity')&&staffPanel.includes('Refresh report'));
check('Parent health screen explains consent and urgent-contact limitation',parentPanel.includes('active guardian consent')&&parentPanel.includes('not an emergency service'));
check('Staff API requests are school-scoped and encode student/record identifiers',staffApi.includes('encodeURIComponent(org)')&&staffApi.includes('encodeURIComponent(school)')&&staffApi.includes('encodeURIComponent(studentId)')&&staffApi.includes('encodeURIComponent(caseId)'));
console.log(`\nP544 focused verifier: ${passes} passed, ${failures} failed`);
process.exit(failures?1:0);
