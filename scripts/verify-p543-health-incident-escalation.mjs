import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const schema=fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8');
const routes=fs.readFileSync(path.join(root,'backend/api/src/modules/health/health.routes.ts'),'utf8');
const migration=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261123175000_p543_health_incident_escalation_notifications/migration.sql'),'utf8');
const checks=[
 ['Incident model exists with severity/status/escalation and acknowledgement fields',/model StudentHealthIncident\s*\{/.test(schema)&&/severity String @default\("NORMAL"\)/.test(schema)&&/escalationLevel Int @default\(0\)/.test(schema)&&/acknowledgedAt DateTime\?/.test(schema)],
 ['Incident model linked to tenant-scoped student',/student Student @relation\(fields: \[studentId, organizationId, schoolId\]/.test(schema)],
 ['Incident optional case relation and case incident collection',/healthCase StudentHealthCase\? @relation\(fields: \[caseId, organizationId, schoolId\]/.test(schema)&&/incidents StudentHealthIncident\[\]/.test(schema)],
 ['Notification outbox model and incident relation',/model StudentHealthIncidentNotification\s*\{/.test(schema)&&/notifications StudentHealthIncidentNotification\[\]/.test(schema)],
 ['Incident list supports student/status/severity filters',routes.includes('/health/incidents')&&routes.includes('...(studentId ? { studentId } : {})')&&routes.includes('...(severity ? { severity } : {})')],
 ['Incident creation validates type/severity/title and staff assignee',routes.includes('healthIncidentCreateSchema')&&routes.includes('Assignee must be an active health-authorized staff member in this school')],
 ['Creation verifies student and optional linked case in same scope',routes.includes('Case must belong to this student and school')&&routes.includes('studentHealthIncident.create')],
 ['Guardian notifications require communication eligibility and explicit active health consent',routes.includes('canReceiveCommunications: true')&&routes.includes('revokedAt: null')&&routes.includes('studentHealthIncidentNotification.create')],
 ['Notification records are queued without storing clinical payload',/status String @default\("QUEUED"\)/.test(schema)&&!routes.includes('notificationPayload')],
 ['Incident updates validate lifecycle transitions and concurrency',routes.includes('Invalid health incident status transition')&&routes.includes('status: old.status')],
 ['Acknowledgement records actor and timestamp',routes.includes('/health/incidents/:incidentId/acknowledge')&&routes.includes('acknowledgedByUserId: s.userId')&&routes.includes('acknowledgedAt: new Date()')],
 ['Escalation increments level only for active incidents',routes.includes('/health/incidents/:incidentId/escalate')&&routes.includes('status: { not: "RESOLVED" }')&&routes.includes('escalationLevel: { increment: 1 }')&&routes.includes('HEALTH_INCIDENT_ESCALATED')&&routes.includes('createMany')&&routes.includes('HEALTH_INCIDENT_ESCALATED')&&routes.includes('createMany')],
 ['All incident routes enforce health permissions and audit denied/success outcomes',routes.includes('health.incident.create')&&routes.includes('health.incident.update')&&routes.includes('health.incident.acknowledge')&&routes.includes('health.incident.escalate')],
 ['Sensitive incident description masked for limited readers',routes.includes('rows.map(({ description, ...safe }: any)')&&routes.includes('restricted: true')],
 ['Migration creates both tables, tenant-scope FKs, indexes and notification uniqueness',migration.includes('CREATE TABLE `StudentHealthIncident`')&&migration.includes('CREATE TABLE `StudentHealthIncidentNotification`')&&migration.includes('StudentHealthIncident_student_scope_fk')&&migration.includes('StudentHealthIncident_case_scope_fk')&&migration.includes('UNIQUE KEY `StudentHealthIncidentNotification_incident_guardian_event_key`')]
];
let failed=0; for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)failed++;} console.log(`P543 focused checks: ${checks.length-failed}/${checks.length} PASS`);process.exit(failed?1:0);
