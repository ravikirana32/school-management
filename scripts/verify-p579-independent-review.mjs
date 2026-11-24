import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const required = [
  'P579-STATUS.md','P579-DELIVERY-REPORT.md','P579-TEST-REPORT.md','P579-VERIFICATION-MATRIX.md',
  'P579-RELEASE-BLOCKERS.md','P579-RISK-ACCEPTANCE-LOG.md','P579-PRIVACY-LEGAL-REVIEW.md',
  'P579-SBOM-DEPENDENCY-INVENTORY.json','P579-SECRETS-REVIEW.md','P579-DEPLOYMENT-ROLLBACK-PLAN.md',
  'P579-NEXT-ACTIONS.md','P579-VERIFICATION-RESULTS.json','P579-DELIVERY-METADATA.json',
  'P579-C2-11-FOCUSED-VERIFIERS.log','P579-STATIC-VERIFIER-SUITE.log','MASTER-OPEN-GAPS-REGISTER.md',
  'docs/MASTER-OPEN-GAPS-REGISTER.md','docs/phases/MASTER-OPEN-GAPS-REGISTER.md',
  'C2-11-ROADMAP.md','docs/C2-11-ROADMAP.md','docs/phases/C2-11-ROADMAP.md',
  'C2-11-PROGRESS.md','docs/C2-11-PROGRESS.md','docs/phases/C2-11-PROGRESS.md'
];
check('P579 required review artifacts exist', required.every(existsSync), `${required.filter(existsSync).length}/${required.length}`);
for (const group of [
  ['MASTER-OPEN-GAPS-REGISTER.md','docs/MASTER-OPEN-GAPS-REGISTER.md','docs/phases/MASTER-OPEN-GAPS-REGISTER.md'],
  ['C2-11-ROADMAP.md','docs/C2-11-ROADMAP.md','docs/phases/C2-11-ROADMAP.md'],
  ['C2-11-PROGRESS.md','docs/C2-11-PROGRESS.md','docs/phases/C2-11-PROGRESS.md']
]) {
  const hashes = group.map((p) => createHash('sha256').update(read(p)).digest('hex'));
  check(`Mirror equality: ${group[0]}`, new Set(hashes).size === 1, hashes.join(' '));
}
const register = read('MASTER-OPEN-GAPS-REGISTER.md');
const openCount = register.split('\n').filter((line) => line.startsWith('- [ ]')).length;
check('P580 consolidated master unchecked gap count is 737 (P579 baseline 729 + P580 additions 8)', openCount === 737, `observed=${openCount}`);
check('P579-G001 through G008 all remain OPEN', Array.from({length:8},(_,i)=>`P579-G00${i+1}`).every(id => new RegExp(`\\[ \\] ${id} .*OPEN`).test(register)), 'No P579 gap closed');
check('P580-G001 through G008 all remain OPEN', Array.from({length:8},(_,i)=>`P580-G00${i+1}`).every(id => new RegExp(`\\[ \\] ${id} .*OPEN`).test(register)), 'P580 Docker/docs acceptance remains open');
const decision = JSON.parse(read('P579-VERIFICATION-RESULTS.json'));
check('Release decision is fail-closed NO-GO', decision.decision === 'NO-GO', decision.decision);
check('P573 missing lockfile remains explicitly blocked', decision.focused_verifier_results.some(x => x.script.includes('verify-p573-migration-artifacts') && x.result.startsWith('FAIL')), 'P573 prerequisite failure retained');
check('Historical full suite is explicitly incomplete', decision.historical_static_suite.status === 'INCOMPLETE_TIMEOUT_300_SECONDS' && decision.historical_static_suite.completed_pass === 68 && decision.historical_static_suite.failures_before_timeout === 1, JSON.stringify(decision.historical_static_suite));
check('No runtime acceptance is falsely marked PASS', Object.values(decision.runtime_acceptance).every(v => v === 'NOT_RUN'), JSON.stringify(decision.runtime_acceptance));
const sbom = JSON.parse(read('P579-SBOM-DEPENDENCY-INVENTORY.json'));
check('Dependency inventory does not claim complete SBOM', sbom.complete_resolved_sbom === false, `manifests=${sbom.manifest_count}`);
check('Privacy/legal review remains unsigned', read('P579-PRIVACY-LEGAL-REVIEW.md').includes('NOT PERFORMED / NOT APPROVED'));
check('Secrets scan limitation disclosed', read('P579-SECRETS-REVIEW.md').includes('NOT EXECUTED'));
check('Deployment rollback rehearsal limitation disclosed', read('P579-DEPLOYMENT-ROLLBACK-PLAN.md').includes('not rehearsed'));
check('Release blockers are explicitly open', read('P579-RELEASE-BLOCKERS.md').includes('All blockers remain OPEN'));
check('No risk is falsely accepted', read('P579-RISK-ACCEPTANCE-LOG.md').includes('No risk is marked accepted'));
check('C2-11 records all eight phase artifacts but not production acceptance', read('C2-11-PROGRESS.md').includes('are 8/8 delivered') && read('C2-11-PROGRESS.md').includes('NOT production-accepted'));
const failures = checks.filter(x => !x.pass);
console.log(JSON.stringify({ phase:'P579', checks, pass:checks.length-failures.length, fail:failures.length, result:failures.length?'FAIL':'PASS' }, null, 2));
if (failures.length) process.exit(1);
