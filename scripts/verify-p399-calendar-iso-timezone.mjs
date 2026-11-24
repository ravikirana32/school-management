import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('apps/school-admin/src/school-config-transfer.ts','utf8');
const checks=[]; const check=(label,pass)=>checks.push({label,pass:Boolean(pass)});
check('strict ISO helper exported',/export function parseStrictIsoTimestamp/.test(source));
check('calendar validator uses strict helper',/parseStrictIsoTimestamp\(event\.startsAt\)[\s\S]*parseStrictIsoTimestamp\(event\.endsAt\)/.test(source));
check('timezone must be explicit',/T\(\\d\{2\}\):\(\\d\{2\}\):\(\\d\{2\}\)[\s\S]*\(Z\|\[\+\-\]/.test(source));
check('calendar error states timezone requirement',/explicit timezone/.test(source));
const match=source.match(/export function parseStrictIsoTimestamp\(value: unknown\): number \| null \{[\s\S]*?\n\}/);
if(!match){console.error('FAIL helper extraction');process.exit(1);}
let helper=match[0].replace('export function ','function ').replace('value: unknown','value').replace(': number | null','');
const sandbox={}; vm.createContext(sandbox); vm.runInContext(`${helper}; this.parseStrictIsoTimestamp=parseStrictIsoTimestamp;`,sandbox);
const parse=sandbox.parseStrictIsoTimestamp;
const runtime=[
 ['UTC timestamp accepted',parse('2026-11-21T10:30:00Z')!==null],
 ['offset timestamp accepted',parse('2026-11-21T10:30:00+05:30')!==null],
 ['fractional seconds accepted',parse('2026-11-21T10:30:00.123Z')!==null],
 ['missing timezone rejected',parse('2026-11-21T10:30:00')===null],
 ['date-only rejected',parse('2026-11-21')===null],
 ['invalid month rejected',parse('2026-13-21T10:30:00Z')===null],
 ['rollover date rejected',parse('2026-02-30T10:30:00Z')===null],
 ['invalid clock rejected',parse('2026-11-21T25:30:00Z')===null],
 ['invalid offset rejected',parse('2026-11-21T10:30:00+99:99')===null],
 ['offset beyond ISO range rejected',parse('2026-11-21T10:30:00+14:01')===null],
 ['empty value rejected',parse('')===null]
];
for(const [label,pass] of runtime)check(label,pass);
for(const c of checks)console.log(`${c.pass?'PASS':'FAIL'} ${c.label}`);
console.log(`RESULT ${checks.filter(c=>c.pass).length}/${checks.length}`);
if(checks.some(c=>!c.pass))process.exitCode=1;
