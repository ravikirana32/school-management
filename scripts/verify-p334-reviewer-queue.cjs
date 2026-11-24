const fs=require('node:fs');const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const api=fs.readFileSync('backend/api/src/modules/admissions/admission.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/AdmissionsWorkspace.tsx','utf8');
const checks=[
 ['Dedicated personal queue endpoint',api.includes('/applications/my-review-queue')],
 ['Session user is the queue assignee',api.includes('assignedReviewerId:s.userId')],
 ['Queue limited to active review statuses',api.includes('status:{in:["SUBMITTED","UNDER_REVIEW","DOCUMENTS_PENDING"]}')],
 ['Organization and school scoped',api.includes('organizationId:s.organizationId,schoolId:s.schoolId,assignedReviewerId:s.userId')],
 ['Read permission scope enforced',api.includes('scope(req,res,"admissions.read")')],
 ['Bounded oldest-first queue',api.includes('orderBy:[{updatedAt:"asc"},{createdAt:"asc"}],take:200')],
 ['UI requests personal queue from API',ui.includes('request("/applications/my-review-queue")')],
 ['UI filters applications by fetched IDs',ui.includes('reviewerQueueFilter==="MINE"?myQueueIds.has(a.id)')&&ui.includes('My assigned queue')]
];for(const [label,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${label}`);
const out=ts.transpileModule(api,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true});const syntax=(out.diagnostics||[]).length===0;console.log(`${syntax?'PASS':'FAIL'} API route syntax transpile (${out.diagnostics?.length||0})`);checks.push(['API route syntax',syntax]);
const baseline=fs.readFileSync('/tmp/p332-compare/AdmissionsWorkspace.tsx','utf8');const baselineDiagnostics=(ts.transpileModule(baseline,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true}).diagnostics||[]).length;
const currentDiagnostics=(ts.transpileModule(ui,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true}).diagnostics||[]).length;
const baselinePreserved=baselineDiagnostics===currentDiagnostics;console.log(`${baselinePreserved?'PASS':'FAIL'} Admin workspace parser diagnostic count unchanged from P332 baseline (${baselineDiagnostics} -> ${currentDiagnostics})`);checks.push(['Admin workspace parser diagnostic count unchanged',baselinePreserved]);
if(checks.some(x=>!x[1]))process.exit(1);console.log(`P334 verification ${checks.filter(x=>x[1]).length}/${checks.length} PASS`);
