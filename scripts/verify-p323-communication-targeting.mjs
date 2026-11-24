import fs from 'node:fs';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const routes=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/CommunicationWorkspace.tsx','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261120093000_p323_communication_targeting/migration.sql','utf8');
const checks=[
 ['Academic year target field',schema.includes('targetAcademicYearId String?')],
 ['Grade target field',schema.includes('targetGradeLevelId String?')],
 ['Section target field',schema.includes('targetSectionName String? @db.VarChar(40)')],
 ['Migration columns',migration.includes('ADD COLUMN "targetGradeLevelId"')&&migration.includes('ADD COLUMN "targetSectionName"')],
 ['Year required for grade/section targeting',routes.includes('Academic year is required for grade/section targeting')],
 ['Grade required for section targeting',routes.includes('Grade is required when targeting a section')],
 ['Publish resolves enrolled student IDs',routes.includes('targetStudentIds=[...new Set(enrollments.map(e=>e.studentId))')],
 ['Guardian links narrowed to target roster',routes.includes('...(targetStudentIds?{studentId:{in:targetStudentIds}}:{})')],
 ['Student account links narrowed',routes.includes('...(targetStudentIds?{studentId:{in:targetStudentIds}}:{})')],
 ['UI targeting fields',ui.includes('targetAcademicYearId')&&ui.includes('targetGradeLevelId')&&ui.includes('targetSectionName')],
 ['Target scope shown on announcement',ui.includes('row.targetGradeLevelId?')&&ui.includes('row.targetSectionName?')&&ui.includes('row.targetAcademicYearId?')],
 ['Targeting index',migration.includes('SchoolCommunication_targeting_idx')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`${checks.length-failed}/${checks.length} passed`);if(failed)process.exit(1);
