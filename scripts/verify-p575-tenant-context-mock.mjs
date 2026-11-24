import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const source=readFileSync('backend/api/src/modules/auth/tenant-context.ts','utf8');
const js=ts.transpile(source,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const mod=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const helpers=[
 ['tenant',cb=>mod.withTenantContext(cb.prisma,{organizationId:'org-a',schoolId:'school-a',userId:'user-a'},cb.work),null],
 ['identity',cb=>mod.withIdentityContext(cb.prisma,'user-a',cb.work),null],
 ['platform',cb=>mod.withPlatformContext(cb.prisma,cb.work),'app.is_platform_admin'],
 ['parent',cb=>mod.withParentWorkerContext(cb.prisma,cb.work),'app.parent_delivery_worker'],
 ['document',cb=>mod.withDocumentWorkerContext(cb.prisma,cb.work),'app.document_scan_worker'],
 ['notification',cb=>mod.withNotificationWorkerContext(cb.prisma,cb.work),'app.notification_worker'],
 ['verification',cb=>mod.withReportCardVerificationContext(cb.prisma,cb.work),'app.report_card_verification'],
];
for(const [name,invoke,enabled] of helpers){
 const calls=[];const tx={$executeRaw:async(q,...values)=>{const sql=q.join('');calls.push({sql,value:values[0]??sql.match(/,\s*'([^']*)',\s*true\)/)?.[1]});return 1;}};const prisma={$transaction:async work=>work(tx)};
 await invoke({prisma,work:async()=> 'ok'});
 for(const flag of ['app.is_platform_admin','app.parent_delivery_worker','app.document_scan_worker','app.notification_worker','app.report_card_verification']){const writes=calls.filter(call=>call.sql.includes(flag));assert.ok(writes.length,`${name}: ${flag} reset missing`);assert.equal(writes.at(-1).value,flag===enabled?'true':'false',`${name}: unexpected ${flag}`);}
 assert.ok(calls.every(call=>call.sql.includes(', true)')),`${name}: context setting is not transaction-local`);
}
let tenantGuard=false;try{await mod.withTenantContext({$transaction:()=>{throw Error('unexpected transaction')}},{organizationId:''},async()=>{});}catch(error){tenantGuard=error.message==='Organization scope is required';}assert.ok(tenantGuard);
let identityGuard=false;try{await mod.withIdentityContext({$transaction:()=>{throw Error('unexpected transaction')}},'',async()=>{});}catch(error){identityGuard=error.message==='User identity is required';}assert.ok(identityGuard);
console.log('P575 tenant context executable mock checks: 9/9 PASS (7 helpers + 2 required-scope guards)');
