import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const schema=fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8');
const routes=fs.readFileSync(path.join(root,'backend/api/src/modules/library/library.routes.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/school-admin/src/LibraryWorkspace.tsx'),'utf8');
const migration=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261124250000_p557_library_lost_damaged_writeoff/migration.sql'),'utf8');
const checks=[
 ['copy lifecycle reason schema field',schema.includes('lifecycleReason String?')],
 ['copy lifecycle updated timestamp',schema.includes('lifecycleUpdatedAt DateTime?')],
 ['copy write-off timestamp',schema.includes('writtenOffAt DateTime?')],
 ['migration adds lifecycle reason',migration.includes('"lifecycleReason" TEXT')],
 ['migration adds lifecycle timestamp',migration.includes('"lifecycleUpdatedAt" TIMESTAMP')],
 ['migration adds write-off timestamp',migration.includes('"writtenOffAt" TIMESTAMP')],
 ['lifecycle route scoped to library.manage',routes.includes('base+"/copies/:copyId/lifecycle"')&&routes.includes('scope(req,res,"library.manage")')],
 ['lost status supported',routes.includes('enum(["LOST","DAMAGED","AVAILABLE"])')],
 ['damaged status supported',routes.includes('"DAMAGED"')],
 ['on-loan and on-hold guarded',routes.includes('["ON_LOAN","ON_HOLD"].includes(copy.status)')],
 ['replacement charge ledger type',routes.includes('type:"REPLACEMENT_CHARGE"')],
 ['reason validated and mandatory',routes.includes('reason:z.string().trim().min(3).max(500)')],
 ['write-off endpoint present',routes.includes('base+"/copies/:copyId/write-off"')],
 ['write-off only lost/damaged',routes.includes('status:{in:["LOST","DAMAGED"]}')],
 ['written-off status persisted',routes.includes('status:"WRITTEN_OFF"')],
 ['replacement charge borrower guard',routes.includes('Borrower ID is required for a replacement charge')],
 ['admin UI copy selector',ui.includes('Select copy')],
 ['admin UI lost/damaged controls',ui.includes('Mark Lost')&&ui.includes('Mark Damaged')],
 ['admin UI replacement charge input',ui.includes('Replacement charge ₹ (optional)')],
 ['admin UI lifecycle submit handler',ui.includes('updateCopyLifecycle')],
 ['admin UI write-off action',ui.includes('Write off')&&ui.includes('writeOffCopy(c.id)')],
 ['cumulative archive docs mention P557',fs.existsSync(path.join(root,'docs/phases/P557/P557-DELIVERY-REPORT.md'))]
];
let pass=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}
console.log(`RESULT ${pass}/${checks.length}`);
if(pass!==checks.length)process.exit(1);
