import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';
const route=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/FeeStructuresWorkspace.tsx','utf8');
const main=fs.readFileSync('apps/school-admin/src/main.tsx','utf8');
for(const [name,source,pattern] of [
 ['Preview API',route,/assignment-preview/],['Assignment API',route,/fee-structures\/:structureId\/assign/],['Published structure requirement',route,/status:'PUBLISHED'/],['Enrolled-only selection',route,/status:'ENROLLED'/],['School-scoped year validation',route,/academicYearId:.*organizationId:s\.organizationId,schoolId:s\.schoolId/],['Duplicate prevention',route,/duplicateChargesSkipped/],['Audit event',route,/fee\.structure\.assigned/],['Assignment UI',ui,/Assign to students/],['Preview action UI',ui,/previewAssignment/],['Confirm assignment UI',ui,/Confirm assignment/],['Finance workspace wiring',main,/FeeStructuresWorkspace/]
]) assert.match(source,pattern,`${name} static assertion failed`);
for(const file of ['apps/school-admin/src/FeeStructuresWorkspace.tsx','apps/school-admin/src/main.tsx','backend/api/src/modules/parents/parent.routes.ts']) {
 const source=fs.readFileSync(file,'utf8'); const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 const errors=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
 assert.equal(errors.length,0,`${file}: ${errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; ')}`);
}
console.log('P276 static assertions: 11/11 passed; TypeScript syntax transpilation: 3/3 passed');
