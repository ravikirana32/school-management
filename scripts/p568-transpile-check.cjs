
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); const fs=require('fs');
const files=[
'backend/api/src/modules/hostel/hostel.routes.ts',
'backend/api/src/modules/hostel/hostel-leave-notifications.ts',
'backend/api/src/modules/parents/parent.routes.ts',
'backend/api/src/workers/notification-delivery-worker.ts',
'backend/api/src/workers/hostel-leave-return-monitor-worker.ts',
'backend/api/src/modules/notifications/delivery-webhook.routes.ts',
'apps/school-admin/src/HostelWorkspace.tsx',
'apps/parent-mobile/App.tsx',
'apps/parent-mobile/src/hostel/HostelLeaveScreen.tsx'
];
let failed=0;
for(const p of files){
 const source=fs.readFileSync(p,'utf8');
 const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 const diagnostics=result.diagnostics||[];
 console.log(`${diagnostics.length===0?'PASS':'FAIL'} ${p}: ${diagnostics.length} syntax diagnostics`);
 for(const d of diagnostics){console.log(ts.flattenDiagnosticMessageText(d.messageText,'\n'));failed++;}
}
console.log(`P568 transpilation: ${files.length-failed}/${files.length} files without diagnostics`);
if(failed)process.exit(1);
