import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const required=['p491','p492','p493','p494','p495','p496','p497'];
const expectedTotals={p491:39,p492:32,p493:29,p494:25,p495:31,p496:32,p497:25};
const checks=[]; const regression=[];
for(const id of required){
 const files=fs.readdirSync(path.join(root,'scripts')).filter(f=>f.startsWith(`verify-${id}-`)&&f.endsWith('.mjs'));
 checks.push([`${id.toUpperCase()} verifier source exists`,files.length===1]);
 if(files.length!==1){regression.push(`ERROR: expected one verifier for ${id}, found ${files.length}`);continue;}
 const run=spawnSync(process.execPath,[path.join(root,'scripts',files[0])],{cwd:root,encoding:'utf8'});
 const output=(run.stdout||'')+(run.stderr||''); regression.push(`\n===== ${id.toUpperCase()} (${files[0]}) exit=${run.status} =====\n${output}`);
 checks.push([`${id.toUpperCase()} verifier executes with exit 0`,run.status===0]);
 const expected=expectedTotals[id];
 checks.push([`${id.toUpperCase()} output includes expected ${expected}/${expected} pass total`,output.includes(`${expected}/${expected}`)]);
}
const gap=read('MASTER-OPEN-GAPS-REGISTER.md');
checks.push(['P497 open gaps remain tracked in master register',gap.includes('P497-G001 OPEN')&&gap.includes('P497-G002 OPEN')&&gap.includes('P497-G003 OPEN')]);
checks.push(['P490 verifier source is retained',fs.existsSync(path.join(root,'scripts/verify-p490-student-cycle-closure.mjs'))]);
checks.push(['P496 cache verifier source is retained',fs.existsSync(path.join(root,'scripts/verify-p496-student-offline-cache.mjs'))]);
checks.push(['P497 accessibility verifier source is retained',fs.existsSync(path.join(root,'scripts/verify-p497-mobile-accessibility.mjs'))]);
checks.push(['P497 retained report and evidence set is present', ['P497-DELIVERY-REPORT.md','P497-STATUS.md','P497-TEST-REPORT.md','P497-ARCHIVE-MANIFEST.json','P497-STATIC-ASSERTIONS.txt'].every(f=>fs.existsSync(path.join(root,'docs/phases/P497',f))) && fs.existsSync(path.join(root,'docs/phases/P497/verify-p497-mobile-accessibility.mjs'))]);
checks.push(['Root and docs master gap register mirrors match',read('MASTER-OPEN-GAPS-REGISTER.md')===read('docs/MASTER-OPEN-GAPS-REGISTER.md')&&read('MASTER-OPEN-GAPS-REGISTER.md')===read('docs/phases/MASTER-OPEN-GAPS-REGISTER.md')]);
checks.push(['P497 verifier is registered in package scripts', read('package.json').includes('verify:p497')]);
checks.push(['P498 verifier source is registered in package scripts', read('package.json').includes('verify:p498')]);
checks.push(['P498 phase report set is present', ['P498-DELIVERY-REPORT.md','P498-STATUS.md','P498-TEST-REPORT.md','P498-ARCHIVE-MANIFEST.json','P498-STATIC-ASSERTIONS.txt'].every(f=>fs.existsSync(path.join(root,'docs/phases/P498',f)))]);
checks.push(['P498 open gap section is present in master register',gap.includes('## P498 — C2-07 Full Integration Closure')]);
let passed=0;
for(const [label,ok] of checks){assert.ok(ok,`FAIL: ${label}`);passed++;console.log(`PASS ${passed}: ${label}`);}
console.log(`P498 Full Integration Closure verifier: ${passed}/${checks.length} PASS`);
console.log(regression.join('\n'));
