import fs from 'node:fs';
import assert from 'node:assert/strict';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const routes=fs.readFileSync('backend/api/src/modules/library/library.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/LibraryWorkspace.tsx','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261124200000_p552_library_barcode_bulk_accession/migration.sql','utf8');
const checks=[
 ['copy model includes barcode field',()=>assert.ok(schema.includes('barcodeValue String? @unique'))],
 ['copy model includes QR payload',()=>assert.ok(schema.includes('qrPayload String?'))],
 ['migration adds barcode column',()=>assert.ok(migration.includes('ADD COLUMN "barcodeValue" TEXT'))],
 ['migration adds QR payload column',()=>assert.ok(migration.includes('ADD COLUMN "qrPayload" TEXT'))],
 ['migration creates barcode uniqueness',()=>assert.ok(migration.includes('UNIQUE INDEX'))],
 ['single-copy creation populates barcode',()=>assert.ok(routes.includes('barcodeValue:`LIB-${p.data.accessionNumber}`'))],
 ['single-copy creation populates QR payload',()=>assert.ok(routes.includes('qrPayload:JSON.stringify({type:"school-library-copy"'))],
 ['book search supports accession',()=>assert.ok(routes.includes('accessionNumber:{contains:String(req.query.search'))],
 ['book search supports barcode',()=>assert.ok(routes.includes('barcodeValue:{contains:String(req.query.search'))],
 ['bulk accession route exists',()=>assert.ok(routes.includes('/bulk-accession'))],
 ['bulk import capped at 100 records',()=>assert.ok(routes.includes('.max(100)'))],
 ['bulk import rejects duplicate accessions',()=>assert.ok(routes.includes('Duplicate accession number in request'))],
 ['bulk import creates catalogue title records',()=>assert.ok(routes.includes('tx.libraryBook.create'))],
 ['bulk import creates physical copy records',()=>assert.ok(routes.includes('tx.libraryCopy.create'))],
 ['bulk import populates barcode and QR payload',()=>assert.ok(routes.includes('barcodeValue:`LIB-${r.accessionNumber}`')&&routes.includes('qrPayload:JSON.stringify'))],
 ['Admin workspace provides bulk accession input',()=>assert.ok(ui.includes('Bulk accession'))],
 ['Admin workspace calls bulk endpoint',()=>assert.ok(ui.includes("request('/bulk-accession'"))],
 ['Admin UI displays barcode values',()=>assert.ok(ui.includes('Barcode ${c.barcodeValue}'))],
 ['bulk accession import refreshes library data',()=>assert.ok(ui.includes('bulkAccession')&&ui.includes('await load()'))]
];
let failed=0;for(const [name,fn] of checks){try{fn();console.log(`PASS ${name}`)}catch(e){failed++;console.error(`FAIL ${name}: ${e.message}`)}}
console.log(`P552 focused verification: ${checks.length-failed}/${checks.length} PASS`);if(failed)process.exit(1);
