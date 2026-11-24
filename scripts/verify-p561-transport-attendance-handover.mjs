import fs from 'node:fs';
const schema=fs.readFileSync(new URL('../backend/api/prisma/schema.prisma',import.meta.url),'utf8');
const routes=fs.readFileSync(new URL('../backend/api/src/modules/transport/transport.routes.ts',import.meta.url),'utf8');
const driver=fs.readFileSync(new URL('../apps/driver-mobile/App.tsx',import.meta.url),'utf8');
const admin=fs.readFileSync(new URL('../apps/school-admin/src/TransportWorkspace.tsx',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../backend/api/prisma/migrations/20261124090000_p561_transport_trip_attendance_handover/migration.sql',import.meta.url),'utf8');
const checks=[
['attendance model exists',schema.includes('model TransportTripAttendance')],
['unique trip student stop constraint',schema.includes('@@unique([tripId, studentId, stopId])')],
['attendance status domain',routes.includes('MISSED_STOP')&&routes.includes('HANDED_OVER')],
['tenant-scoped attendance GET',routes.includes('/trips/:tripId/attendance')],
['admin manage permission for write',routes.includes('scope(req,res,"transport.manage")')],
['student active route allocation validation',routes.includes('studentId:d.studentId,routeId:trip?.routeId,status:"ACTIVE"')],
['route-bound stop validation',routes.includes('routeId:trip?.routeId')],
['handover recipient required',routes.includes('handoverTo is required for HANDED_OVER status')],
['attendance upsert avoids duplicate records',routes.includes('transportTripAttendance.upsert')],
['daily attendance summary API',routes.includes('/attendance-summary')],
['driver/attendant assignment authorization',routes.includes('route.driverId===personnel.id||trip.route.attendantId===personnel.id')],
['mobile roster and attendance controls',driver.includes('Load pickup/drop attendance roster')&&driver.includes('MISSED_STOP')],
['mobile handover field/action',driver.includes('Handover recipient name')&&driver.includes('HANDED_OVER')],
['admin attendance summary UI',admin.includes('Daily pickup/drop attendance')&&admin.includes('/attendance-summary')],
['migration table and foreign key',migration.includes('CREATE TABLE "TransportTripAttendance"')&&migration.includes('TransportTripAttendance_tripId_fkey')],
['migration uniqueness and indexes',migration.includes('TransportTripAttendance_tripId_studentId_stopId_key')&&migration.includes('TransportTripAttendance_organizationId_schoolId_tripId_status_idx')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}console.log(`${checks.length-failed}/${checks.length} passed`);process.exit(failed?1:0);
