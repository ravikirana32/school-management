import fs from 'node:fs';
const source = fs.readFileSync('apps/school-admin/src/FeeStructuresWorkspace.tsx', 'utf8');
const checks = [
  ['draft edit entrypoint', source.includes('function startEdit(row: FeeStructure)') && source.includes('Edit draft')],
  ['prefill structure fields', source.includes('code: row.code') && source.includes('name: row.name') && source.includes('currency: row.currency')],
  ['component prefill', source.includes('(row.components || []).map(c => ({ ...c, amount: String(c.amount) }))')],
  ['PATCH edit mode', source.includes('method: editId ? "PATCH" : "POST"') && source.includes('encodeURIComponent(editId)')],
  ['cancel/reset edit', source.includes('function cancelEdit()') && source.includes('onClick={cancelEdit}')],
  ['optional dates omitted', source.includes('...(form.effectiveFrom ? { effectiveFrom: form.effectiveFrom } : {})') && source.includes('...(form.effectiveTo ? { effectiveTo: form.effectiveTo } : {})')],
  ['draft edit permissions', source.includes('row.status === "DRAFT" && can("fees.manage")')],
];
let failed = 0;
for (const [label, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`); if (!pass) failed++; }
console.log(`${checks.length - failed}/${checks.length} checks passed`);
if (failed) process.exitCode = 1;
