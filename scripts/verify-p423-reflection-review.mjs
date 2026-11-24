import fs from 'node:fs'; import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const schema=fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8');
const migration=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261121210000_p423_reflection_review_followups/migration.sql'),'utf8');
const api=fs.readFileSync(path.join(root,'backend/api/src/modules/curriculum/curriculum.routes.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/school-admin/src/CurriculumReflectionReviewWorkspace.tsx'),'utf8');
const parent=fs.readFileSync(path.join(root,'apps/school-admin/src/CurriculumOutcomesWorkspace.tsx'),'utf8');
const checks=[
 ['P423 review fields exist in reflection model',schema.includes('followUpStatus String @default("PENDING")')&&schema.includes('coordinatorNotes String? @db.VarChar(3000)')],
 ['Review audit fields included',schema.includes('reviewedAt DateTime?')&&schema.includes('reviewedBy String?')],
 ['Follow-up status indexed',schema.includes('@@index([organizationId, schoolId, followUpStatus, reflectedAt])')],
 ['Migration adds status and review note columns',migration.includes('ADD COLUMN "followUpStatus"')&&migration.includes('ADD COLUMN "coordinatorNotes"')],
 ['Migration adds review audit columns',migration.includes('ADD COLUMN "reviewedAt"')&&migration.includes('ADD COLUMN "reviewedBy"')],
 ['Migration constrains status values',migration.includes("IN ('PENDING','IN_PROGRESS','COMPLETED')")],
 ['Migration creates filtered review index',migration.includes('followup_date_idx')],
 ['Coordinator GET route requires academics.manage',api.includes('lesson-reflection-reviews')&&api.includes('scope(req, res, "academics.manage")')],
 ['GET review query is school/tenant scoped',api.includes('organizationId: s.organizationId, schoolId: s.schoolId')],
 ['GET supports follow-up status filters',api.includes('followUpStatus === "ALL"')],
 ['GET supports staff filtering',api.includes('staffMemberId ? { staffMemberId }')],
 ['GET supports grade and subject filtering',api.includes('gradeLevelId ? { gradeLevelId }')&&api.includes('curriculumSubjectId ? { curriculumSubjectId }')],
 ['GET supports date range',api.includes('fromDate')&&api.includes('toDate')&&api.includes('reflectedAt: {')],
 ['GET caps response size',api.includes('take: 500')],
 ['PATCH review route permission-gated',api.includes('lesson-reflection-reviews/:reflectionId')&&api.includes('scope(req, res, "academics.manage")')],
 ['PATCH validates status values',api.includes('followUpStatus must be PENDING, IN_PROGRESS, or COMPLETED')],
 ['PATCH validates review note limit',api.includes('coordinatorNotes must be text up to 3000 characters')],
 ['PATCH records reviewer and time',api.includes('reviewedAt: new Date()')&&api.includes('reviewedBy: s.userId')],
 ['Review workspace is implemented',ui.includes('Lesson reflection review & follow-up')&&ui.includes('Coordinator review notes')],
 ['UI includes teacher, grade, subject and date filters',ui.includes('Teacher filter')&&ui.includes('Grade filter')&&ui.includes('Subject filter')&&ui.includes('Reflected from')&&ui.includes('Reflected to')],
 ['UI includes follow-up status controls',ui.includes('IN_PROGRESS')&&ui.includes('COMPLETED')&&ui.includes('Save review')],
 ['Workspace mounted into curriculum outcomes',parent.includes('CurriculumReflectionReviewWorkspace')],
 ['UI uses academics.manage capability',ui.includes('can("academics.manage")')],
 ['No unrestricted tenant query in review endpoints',api.includes('withTenantContext(prisma, s')],
];
let fail=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`P423 verifier: ${checks.length-fail}/${checks.length} PASS`);process.exitCode=fail?1:0;
