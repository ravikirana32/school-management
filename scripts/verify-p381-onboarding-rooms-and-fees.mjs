import fs from 'node:fs';
const api=fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx','utf8');
const checks=[
 ['readiness queries active rooms tenant-scoped',api.includes('tx.schoolRoom.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, isActive: true } })')],
 ['rooms readiness requires at least one active room',api.includes('complete: rooms.length > 0')],
 ['rooms task describes room/resource setup',api.includes('School rooms and resources') && api.includes('Open Timetable and configure at least one active room')],
 ['rooms task depends on profile and grades',api.includes('prerequisites: ["profile", "grade-levels"]')],
 ['readiness queries published fee structures tenant-scoped',api.includes('tx.feeStructure.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, status: "PUBLISHED" } })')],
 ['fee readiness scoped to active year or school-wide',api.includes('feeStructures.some(fee => !fee.academicYearId || fee.academicYearId === activeYear?.id)')],
 ['fee structures task depends on year and grade levels',api.includes('prerequisites: ["academic-year", "grade-levels"]')],
 ['fee structures task remediation points to fee workspace',api.includes('Open Fees, create the fee components and publish a structure')],
 ['rooms task navigates to timetable',ui.includes('key: "rooms"') && ui.includes('actionTab: "timetable"')],
 ['fee task navigates to fees',ui.includes('key: "fee-structures"') && ui.includes('actionTab: "fees"')],
 ['onboarding saved-step list includes both new tasks',ui.includes('"grade-levels", "rooms", "fee-structures"')],
 ['API progress and assignment allowlists include room and fee steps',api.includes('"rooms"') && api.includes('"fee-structures"')],
];
let failures=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failures++;}console.log(`${checks.length-failures}/${checks.length} checks passed`);if(failures)process.exit(1);
