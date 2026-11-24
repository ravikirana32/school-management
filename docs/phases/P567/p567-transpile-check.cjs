
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); const fs=require('fs');
for (const p of ['backend/api/src/modules/hostel/hostel.routes.ts','apps/school-admin/src/HostelWorkspace.tsx']) {
 const s=fs.readFileSync(p,'utf8'); const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 console.log(`${p}: ${r.diagnostics?.length||0} diagnostics`);
 for(const d of r.diagnostics||[]) console.log(ts.flattenDiagnosticMessageText(d.messageText,'\n'));
 if(r.diagnostics?.length)process.exitCode=1;
}
