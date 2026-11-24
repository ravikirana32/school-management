import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const registerPath = path.join(root, 'MASTER-OPEN-GAPS-REGISTER.md');
const docsRegisterPath = path.join(root, 'docs/MASTER-OPEN-GAPS-REGISTER.md');
const register = fs.readFileSync(registerPath, 'utf8');
const docsRegister = fs.readFileSync(docsRegisterPath, 'utf8');
const statuses = ['OPEN', 'IN_PROGRESS', 'PARTIALLY_IMPLEMENTED', 'READY_FOR_VERIFICATION', 'BLOCKED_EXTERNAL', 'CLOSED'];
const entries = new Map();
for (const line of register.split(/\r?\n/)) {
  let match = line.match(/^- \[[ xX]\] ([A-Z0-9-]+) — .* — (OPEN|IN_PROGRESS|PARTIALLY_IMPLEMENTED|READY_FOR_VERIFICATION|BLOCKED_EXTERNAL|CLOSED)(?: \(.*)?$/);
  if (!match) match = line.match(/^\|\s*([A-Z0-9-]+)\s*\|.*?\|\s*(OPEN|IN_PROGRESS|PARTIALLY_IMPLEMENTED|READY_FOR_VERIFICATION|BLOCKED_EXTERNAL|CLOSED)\s*\|/);
  if (match) entries.set(match[1], match[2]);
}
const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
for (const status of entries.values()) counts[status]++;
const required = [
  'P79-STATUS.md', 'P80-STATUS.md', 'P81-STATUS.md', 'P82-STATUS.md', 'P83-STATUS.md',
  'P84-STATUS.md', 'P85-STATUS.md', 'P86-STATUS.md', 'P87-STATUS.md', 'P88-STATUS.md',
  'P89-STATUS.md', 'P90-STATUS.md', 'P91-STATUS.md', 'P92-STATUS.md', 'P93-STATUS.md',
  'P94-STATUS.md', 'P95-STATUS.md', 'P96-STATUS.md', 'P97-STATUS.md', 'P98-STATUS.md',
  'P99-STATUS.md', 'P100-STATUS.md', 'P101-STATUS.md', 'P102-STATUS.md', 'P103-STATUS.md',
  'P104-STATUS.md', 'P105-STATUS.md', 'P106-STATUS.md', 'P107-STATUS.md',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
const roadmap = fs.readFileSync(path.join(root, 'docs/REMEDIATION-ROADMAP-P79-P108.md'), 'utf8');
const blockers = counts.OPEN + counts.IN_PROGRESS + counts.PARTIALLY_IMPLEMENTED + counts.READY_FOR_VERIFICATION;
const parity = register === docsRegister;
const checks = {
  registerMirrorByteIdentical: parity,
  uniqueGapIdsParsed: entries.size > 0,
  phaseEvidenceFilesPresent: missing.length === 0,
  roadmapReleaseGatePresent: roadmap.includes('P108 cannot declare completion') && roadmap.includes('signed decision'),
  zeroGapReleaseGate: blockers === 0 && counts.BLOCKED_EXTERNAL === 0,
};
const report = [
  'P108 FINAL ACCEPTANCE STATIC AUDIT',
  `Generated: ${new Date().toISOString()}`,
  `Unique gap IDs: ${entries.size}`,
  ...statuses.map((status) => `${status}: ${counts[status]}`),
  `Unresolved implementation/verification items: ${blockers}`,
  `Missing phase status files: ${missing.length ? missing.join(', ') : 'none'}`,
  `Root register SHA-256: ${crypto.createHash('sha256').update(register).digest('hex')}`,
  `Docs register SHA-256: ${crypto.createHash('sha256').update(docsRegister).digest('hex')}`,
  ...Object.entries(checks).map(([name, passed]) => `${name}: ${passed ? 'PASS' : 'FAIL'}`),
  `FINAL ACCEPTANCE: ${checks.zeroGapReleaseGate && parity && missing.length === 0 ? 'ELIGIBLE FOR FURTHER REVIEW' : 'BLOCKED — NOT ACCEPTED'}`,
].join('\n') + '\n';
fs.writeFileSync(path.join(root, 'P108-ACCEPTANCE-AUDIT.txt'), report);
console.log(report);
if (!parity || missing.length || !checks.roadmapReleaseGatePresent || entries.size === 0) process.exitCode = 1;
