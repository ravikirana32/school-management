#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
const checks=[];
const pass=(name,ok)=>checks.push({name,pass:!!ok});
const regPaths=['MASTER-OPEN-GAPS-REGISTER.md','docs/MASTER-OPEN-GAPS-REGISTER.md','docs/phases/MASTER-OPEN-GAPS-REGISTER.md'];
const regs=regPaths.map(p=>fs.existsSync(p)?fs.readFileSync(p,'utf8'):null);
pass('all three master gap-register mirrors exist',regs.every(Boolean));
pass('master gap-register mirrors are byte-identical',regs.every(x=>x===regs[0]));
const suffix={501:'lockfile-readiness',502:'compilation-remediation',503:'frontend-build-stabilization',504:'backend-build-stabilization',505:'mobile-build-stabilization',506:'shared-workspace-integration',507:'environment-configuration'};
pass('P501-P507 verifier sources are present',Object.entries(suffix).every(([p,s])=>fs.existsSync(`scripts/verify-p${p}-${s}.mjs`)));
pass('P508 phase report exists',fs.existsSync('docs/phases/P508/P508-DELIVERY-REPORT.md'));
pass('P508 readiness matrix exists',fs.existsSync('docs/phases/P508/P508-READINESS-MATRIX.md'));
pass('P508 regression execution record exists',fs.existsSync('docs/phases/P508/P508-REGRESSION-EXECUTION.txt'));
pass('P508 unresolved blockers are retained in register',regs[0]?.includes('## P508 — Consolidated C2-01 Readiness') && regs[0]?.includes('P508-G001 OPEN'));
const result={phase:'P508',title:'Consolidated C2-01 Readiness',checks,total:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,registerHashes:regs.filter(Boolean).map(x=>crypto.createHash('sha256').update(x).digest('hex'))};
console.log(JSON.stringify(result,null,2));
if(result.failed) process.exit(1);
