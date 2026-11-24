import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';
const finance=fs.readFileSync('apps/school-admin/src/FinanceWorkspace.tsx','utf8');
const api=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
for(const [name,source,pattern] of [['Fee payment recording helper',finance,/recordFeePayment/],['Collection button',finance,/Collect payment/],['Payment amount validation',finance,/Number\(paymentDraft\.amount\)>collectionLimit\(charge\)/],['Method selector',finance,/BANK_TRANSFER/],['Reference required',finance,/Receipt or transaction reference/],['Payment endpoint',api,/fees\/:chargeId\/payments/],['Duplicate reference protection',api,/DUPLICATE/],['Overpayment protection',api,/OVERPAYMENT/],['Accounting integration',api,/postFeePayment/]]) assert.match(source,pattern,`${name} assertion failed`);
for(const file of ['apps/school-admin/src/FinanceWorkspace.tsx']){const source=fs.readFileSync(file,'utf8');const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});const errors=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);assert.equal(errors.length,0,errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; '));}
console.log('P277 static assertions: 9/9 passed; TSX syntax transpilation: 1/1 passed');
