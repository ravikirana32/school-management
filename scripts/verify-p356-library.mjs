import fs from 'node:fs';
const root=new URL('../',import.meta.url).pathname;
const checks=[
['Prisma book model',/model LibraryBook\s*\{/.test(fs.readFileSync(root+'backend/api/prisma/schema.prisma','utf8'))],
['Prisma copy model',/model LibraryCopy\s*\{/.test(fs.readFileSync(root+'backend/api/prisma/schema.prisma','utf8'))],
['Prisma loan model',/model LibraryLoan\s*\{/.test(fs.readFileSync(root+'backend/api/prisma/schema.prisma','utf8'))],
['Prisma reservation model',/model LibraryReservation\s*\{/.test(fs.readFileSync(root+'backend/api/prisma/schema.prisma','utf8'))],
['SQL migration exists',fs.existsSync(root+'backend/api/prisma/migrations/20261120160000_p356_library_management/migration.sql')],
['Router file exists',fs.existsSync(root+'backend/api/src/modules/library/library.routes.ts')],
['Router mounted',/libraryRouter/.test(fs.readFileSync(root+'backend/api/src/app.ts','utf8'))],
['Book list/search',/libraryRouter\.get\(base\+"\/books"/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))],
['Book create API',/libraryRouter\.post\(base\+"\/books"/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))],
['Copy create API',/\/books\/:bookId\/copies/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))],
['Loan list API',/\/loans"/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))],
['Issue API',/\/loans\/issue/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))],
['Return API',/\/loans\/:loanId\/return/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))],
['Reservation APIs',/\/reservations/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))],
['School scope in API queries',/organizationId:s\.organizationId,schoolId:s\.schoolId/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))],
['Permission checks',/library\.manage/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))],
['Permission seed',/library\.read/.test(fs.readFileSync(root+'backend/api/prisma/seed.ts','utf8'))],
['Librarian role seed',/SCHOOL_LIBRARY_STAFF/.test(fs.readFileSync(root+'backend/api/prisma/seed.ts','utf8'))],
['Admin UI file',fs.existsSync(root+'apps/school-admin/src/LibraryWorkspace.tsx')],
['Admin UI wired',/LibraryWorkspace/.test(fs.readFileSync(root+'apps/school-admin/src/main.tsx','utf8'))],
['Admin catalogue UI',/Add catalogue title/.test(fs.readFileSync(root+'apps/school-admin/src/LibraryWorkspace.tsx','utf8'))],
['Admin issue workflow',/Issue a copy/.test(fs.readFileSync(root+'apps/school-admin/src/LibraryWorkspace.tsx','utf8'))],
['Admin return workflow',/Return/.test(fs.readFileSync(root+'apps/school-admin/src/LibraryWorkspace.tsx','utf8'))],
['Duplicate accession unique index',/LibraryCopy_accessionNumber_key/.test(fs.readFileSync(root+'backend/api/prisma/migrations/20261120160000_p356_library_management/migration.sql','utf8'))],
['Loan copy foreign key',/LibraryLoan_copyId_fkey/.test(fs.readFileSync(root+'backend/api/prisma/migrations/20261120160000_p356_library_management/migration.sql','utf8'))],
['Book-copy foreign key',/LibraryCopy_bookId_fkey/.test(fs.readFileSync(root+'backend/api/prisma/migrations/20261120160000_p356_library_management/migration.sql','utf8'))],
['Return marks copy available',/data:{status:"AVAILABLE"}/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))],
['Issue only available copies',/status:"AVAILABLE"/.test(fs.readFileSync(root+'backend/api/src/modules/library/library.routes.ts','utf8'))]
];
const failed=checks.filter(x=>!x[1]);for(const [name,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${name}`);console.log(`RESULT ${checks.filter(x=>x[1]).length}/${checks.length}`);process.exit(failed.length?1:0);
