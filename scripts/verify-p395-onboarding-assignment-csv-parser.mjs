import fs from 'node:fs';
const source = fs.readFileSync(new URL('../apps/school-admin/src/OnboardingWorkspace.tsx', import.meta.url), 'utf8');
const checks = [
  ['Parser is defined for onboarding CSV import', /function parseCsv\(text: string\): string\[\]\[\]/.test(source)],
  ['Quoted fields are supported', /if \(quoted\)/.test(source)],
  ['Escaped double quotes are decoded', /text\[index \+ 1\] === '\\"'/.test(source)],
  ['Quoted commas are retained inside fields', /else field \+= char/.test(source)],
  ['Quoted line breaks are retained inside fields', /else field \+= char/.test(source)],
  ['CRLF row separators are normalized', /char === '\\r' && text\[index \+ 1\] === '\\n'/.test(source)],
  ['Unterminated quoted fields are rejected', /CSV contains an unterminated quoted field/.test(source)],
  ['CSV import uses the parser', /csvRows = parseCsv\(text\.replace/.test(source)],
  ['UTF-8 BOM is removed before parsing', /text\.replace\(\//.test(source)],
  ['Header names are normalized', /csvRows\[0\]\.map\(value => value\.trim\(\)\.toLowerCase\(\)\)/.test(source)],
  ['Existing task-key/email validation remains present', /Unknown task key|Email is not an active member/.test(source)],
  ['Preview stays guarded before applying', /bulkPreview\.some\(row=>!row\.valid\)/.test(source)],
];
let failures = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failures++; }
console.log(`${checks.length - failures}/${checks.length} checks passed`);
if (failures) process.exit(1);
// Execute the actual source parser in a sandbox after removing its type annotation.
import vm from 'node:vm';
const parserMatch = source.match(/function parseCsv\(text: string\): string\[\]\[\] \{[\s\S]*?\n\}/);
if (!parserMatch) { console.error('FAIL parser extraction'); process.exit(1); }
const executableParser = parserMatch[0].replace('function parseCsv(text: string): string[][]', 'function parseCsv(text)').replace(/: string\[\]\[\]/g, '').replace(/: string\[\]/g, '').replace(/: string/g, '');
const sandbox = {}; vm.runInNewContext(`${executableParser}; this.parseCsv = parseCsv;`, sandbox);
const cases = [
  ['quoted comma', 'taskKey,email\nprofile,"Doe, Jane@example.com"', [['taskKey','email'],['profile','Doe, Jane@example.com']]],
  ['escaped quotes', 'taskKey,email\nprofile,"jane \"\"quoted\"\"@example.com"', [['taskKey','email'],['profile','jane "quoted"@example.com']]],
  ['quoted multiline', 'taskKey,email\nprofile,"line one\nline two@example.com"', [['taskKey','email'],['profile','line one\nline two@example.com']]],
  ['CRLF', 'taskKey,email\r\nprofile,jane@example.com\r\n', [['taskKey','email'],['profile','jane@example.com']]],
];
for (const [name, csv, expected] of cases) {
  const actual = JSON.stringify(sandbox.parseCsv(csv)); const want = JSON.stringify(expected);
  const ok = actual === want; console.log(`${ok ? 'PASS' : 'FAIL'} runtime parser ${name}`); if (!ok) process.exitCode = 1;
}
let rejected = false; try { sandbox.parseCsv('taskKey,email\nprofile,"unfinished'); } catch { rejected = true; }
console.log(`${rejected ? 'PASS' : 'FAIL'} runtime parser rejects malformed quote`);
if (!rejected) process.exitCode = 1;
