import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = JSON.parse(readFileSync('package.json', 'utf8'));
const checks = [];
function add(label, ok, detail) { checks.push({ label, ok, detail }); }
const nodeMajor = Number(process.versions.node.split('.')[0]);
add('Node.js major version', nodeMajor === 22, `found ${process.version}; expected Node 22`);
const expectedPm = root.packageManager || '';
add('Root packageManager declaration', expectedPm === 'pnpm@9.15.0', `declared ${expectedPm || '(missing)'}; expected pnpm@9.15.0`);
add('pnpm lockfile', existsSync('pnpm-lock.yaml'), existsSync('pnpm-lock.yaml') ? 'pnpm-lock.yaml is present' : 'pnpm-lock.yaml is missing; dependency installation cannot be reproducible yet');
const pnpm = spawnSync('pnpm', ['--version'], { encoding: 'utf8', timeout: 5000 });
const pnpmFound = pnpm.status === 0;
const pnpmVersion = pnpmFound ? pnpm.stdout.trim() : 'not available';
add('pnpm executable', pnpmFound, pnpmFound ? `pnpm ${pnpmVersion} available` : 'pnpm command is unavailable in this environment');
add('pnpm version', pnpmFound && pnpmVersion === '9.15.0', pnpmFound ? `found ${pnpmVersion}; expected 9.15.0` : 'cannot check version until pnpm is installed');
const npmrc = existsSync('.npmrc') ? readFileSync('.npmrc', 'utf8') : '';
add('npmrc exists', existsSync('.npmrc'), existsSync('.npmrc') ? 'workspace npm configuration file present' : '.npmrc is absent');
const registryLine = npmrc.split(/\r?\n/).find((line) => /^\s*registry\s*=/.test(line));
add('Registry configuration', !registryLine || /^\s*registry\s*=\s*https?:\/\//.test(registryLine), registryLine ? `registry setting is ${registryLine.split('=')[1].trim()}` : 'no custom registry configured; npm default applies');
const failed = checks.filter((c) => !c.ok).length;
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'WARN'} ${c.label}: ${c.detail}`);
console.log(`C2-01 bootstrap diagnostics: ${checks.length - failed}/${checks.length} checks PASS; ${failed} warning(s)`);
console.log('This is a diagnostic report: unavailable tools or lockfile are warnings, not a fabricated install/build result.');
