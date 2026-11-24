import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.cwd(),process.cwd().endsWith('backend/api')?'../..':'.');
const checks=[
['P472 delivery report', 'P472-DELIVERY-REPORT.md'],['P472 status','P472-STATUS.md'],['P472 test report','P472-TEST-REPORT.md'],['P472 inventory','docs/phases/P472/P472-security-cycle-closure-inventory.json'],['P472 mirrored gap register','docs/phases/P472/MASTER-OPEN-GAPS-REGISTER.md'],['P472 gap entry in master register','MASTER-OPEN-GAPS-REGISTER.md']
]; let failed=0;
for(const [label,file] of checks){const ok=fs.existsSync(path.join(root,file));console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
const inv=JSON.parse(fs.readFileSync(path.join(root,'docs/phases/P472/P472-security-cycle-closure-inventory.json'),'utf8'));
for(const [label,ok] of [['10 preceding phases consolidated',inv.sourcePhases.length===10],['all ten source verifiers recorded',Object.keys(inv.executedVerifiers).length===10],['runtime explicitly pending',inv.status.includes('runtime-pending')],['six remediation gap IDs recorded',inv.gapIds.length===6],['runtime limitations listed',inv.runtimeNotExecuted.length>=6]]){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
console.log(`P472 verifier: ${11-failed}/11 PASS`);process.exit(failed?1:0);
