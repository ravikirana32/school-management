import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const schema=read("backend/api/prisma/schema.prisma");
const hostel=read("backend/api/src/modules/hostel/hostel.routes.ts");
const parent=read("backend/api/src/modules/parents/parent.routes.ts");
const notifier=read("backend/api/src/modules/hostel/hostel-leave-notifications.ts");
const worker=read("backend/api/src/workers/notification-delivery-worker.ts");
const monitor=read("backend/api/src/workers/hostel-leave-return-monitor-worker.ts");
const admin=read("apps/school-admin/src/HostelWorkspace.tsx");
const parentApp=read("apps/parent-mobile/App.tsx");
const parentScreen=read("apps/parent-mobile/src/hostel/HostelLeaveScreen.tsx");
const seed=read("backend/api/prisma/seed.ts");
const migration=read("backend/api/prisma/migrations/20261124100000_p568_hostel_leave_guardian_notifications/migration.sql");
const pkg=JSON.parse(read("backend/api/package.json"));
const checks=[
["leave request model extended",/model HostelLeaveRequest\s*\{[\s\S]*?allocationId String\?/.test(schema)],
["leave request destination and contact",/model HostelLeaveRequest\s*\{[\s\S]*?destination String\?[\s\S]*?contactNumber String\?/.test(schema)],
["leave request approval/denial lifecycle",/approvedAt DateTime\?[\s\S]*?deniedBy String\?[\s\S]*?deniedAt DateTime\?/.test(schema)],
["leave request cancellation lifecycle",/cancelledAt DateTime\?[\s\S]*?cancelledBy String\?/.test(schema)],
["leave request actual return lifecycle",/actualReturnAt DateTime\?[\s\S]*?returnedBy String\?/.test(schema)],
["leave request late return lifecycle",/lateReturnAt DateTime\?[\s\S]*?lateReturnNote String\?/.test(schema)],
["leave request updated timestamp",/model HostelLeaveRequest\s*\{[\s\S]*?updatedAt DateTime @updatedAt/.test(schema)],
["leave request has multiple pass history",/gatePasses HostelGatePass\[\]/.test(schema)],
["guardian leave consent model",schema.includes("model HostelGuardianConsent")],
["guardian consent tenant scope",/model HostelGuardianConsent\s*\{[\s\S]*?organizationId String[\s\S]*?schoolId String/.test(schema)],
["guardian consent explicit opt-in defaults off",/leaveUpdatesEnabled Boolean @default\(false\)/.test(schema)],
["guardian consent in-app and email preferences",/inAppEnabled Boolean @default\(false\)[\s\S]*?emailEnabled Boolean @default\(false\)/.test(schema)],
["guardian consent has revoke and version fields",/consentVersion String[\s\S]*?grantedAt DateTime\?[\s\S]*?revokedAt DateTime\?/.test(schema)],
["guardian consent relates to student and guardian",/student Student @relation[\s\S]*?guardian Guardian @relation/.test(schema)],
["leave notification event model",schema.includes("model HostelLeaveNotificationEvent")],
["notification event idempotency key",/eventKey String @unique/.test(schema)],
["notification event links leave request",/leaveRequest HostelLeaveRequest @relation/.test(schema)],
["gate pass leave request relation",/leaveRequest HostelLeaveRequest\? @relation/.test(schema)],
["migration alters leave request",migration.includes('ALTER TABLE "HostelLeaveRequest"')],
["migration creates guardian consent",migration.includes('CREATE TABLE "HostelGuardianConsent"')],
["migration creates notification event",migration.includes('CREATE TABLE "HostelLeaveNotificationEvent"')],
["migration adds gate pass FK",migration.includes('"HostelGatePass_leaveRequestId_fkey"')],
["migration inserts parent hostel permission",migration.includes("parent.hostel.manage")&&migration.includes("RolePermission")],
["staff leave list endpoint",hostel.includes('base+"/leave-requests"')],
["staff decision endpoint",hostel.includes('base+"/leave-requests/:leaveRequestId/decision"')],
["staff return checkin endpoint",hostel.includes('base+"/leave-requests/:leaveRequestId/return"')],
["staff notification history endpoint",hostel.includes('base+"/leave-requests/:leaveRequestId/notifications"')],
["warden approval creates resident gate pass",hostel.includes('passType:"RESIDENT_OUT",leaveRequestId:leave.id')],
["warden approval validates active resident",hostel.includes("An active hostel resident allocation is required")],
["overlapping leave requests blocked",hostel.includes("overlapping pending or approved leave request")],
["student leave lock protects approval races",hostel.includes("hostel-leave-student:${leave.studentId}")],
["leave/pass idempotency lock",hostel.includes("hostel-leave:${leave.id}")],
["legacy P567 return syncs leave state",hostel.includes("if(pass.leaveRequestId)")&&hostel.includes("HOSTEL_RESIDENT_RETURNED")],
["return requires checked-out gate pass",hostel.includes('pass.status==="CHECKED_OUT"')],
["late return recorded at verified checkin if monitor missed",hostel.includes("lateReturnAt:leave.lateReturnAt||now")],
["late return distinct status",hostel.includes('late?"RETURNED_LATE":"RETURNED"')],
["parent list leave requests",parent.includes('/portal/children/:studentId/hostel-leaves')],
["parent explicit consent read",parent.includes('/portal/children/:studentId/hostel-consent')],
["parent explicit consent update",parent.includes('parentRouter.put("/:organizationId/:schoolId/portal/children/:studentId/hostel-consent"')],
["parent leave request create",parent.includes('parentRouter.post("/:organizationId/:schoolId/portal/children/:studentId/hostel-leaves"')],
["parent pending leave edit",parent.includes('parentRouter.patch("/:organizationId/:schoolId/portal/children/:studentId/hostel-leaves/:leaveRequestId"')],
["parent leave cancel",parent.includes('/hostel-leaves/:leaveRequestId/cancel')],
["parent student guardian link validated",parent.includes("parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId)")],
["parent leave overlaps blocked",parent.includes("An overlapping pending or approved leave request already exists")],
["parent leave cancellation blocks departed resident",parent.includes("The resident has already departed; contact the hostel warden")],
["notification helper checks linked guardian communication",notifier.includes("canReceiveCommunications:true")],
["notification helper requires accepted portal consent",notifier.includes('status:"ACCEPTED",consentAcceptedAt:{not:null},consentWithdrawnAt:null')],
["notification helper requires explicit hostel consent",notifier.includes("consent.leaveUpdatesEnabled")],
["notification helper creates in-app parent notice",notifier.includes("tx.parentNotification.createMany")],
["notification helper queues email outbox",notifier.includes('channel:"EMAIL",status:"PENDING"')],
["notification events distinguish preference skips",notifier.includes("SKIPPED_PREFERENCE")],
["notification helper records channel events",notifier.includes("hostelLeaveNotificationEvent.upsert")],
["email worker rechecks explicit hostel consent",worker.includes("hostelConsents")&&worker.includes("emailEnabled: true")],
["email worker updates hostel event delivered state",worker.includes('data: { status: "ACCEPTED_BY_PROVIDER", lastError: null }')],
["email worker records retry and dead letter",worker.includes('status: "RETRY"')&&worker.includes('status: "DEAD_LETTER"')],
["provider webhook reconciles hostel email event status",read("backend/api/src/modules/notifications/delivery-webhook.routes.ts").includes("hostelLeaveNotificationEvent.updateMany")],
["late return worker only checks departed passes",monitor.includes('gatePasses:{some:{status:"CHECKED_OUT"}}')],
["late return worker changes status",monitor.includes('data:{status:"LATE_RETURN",lateReturnAt:now')],
["late return worker notifies guardians",monitor.includes("notifyHostelLeaveGuardians")],
["late return worker has recurring interval",monitor.includes("setInterval")],
["production compose includes late return worker",read("docker-compose.prod.yml").includes("worker-hostel-leave-monitor:")],
["worker npm script registered",pkg.scripts["worker:hostel-leave-monitor"]==="tsx src/workers/hostel-leave-return-monitor-worker.ts"],
["parent role has hostel manage permission",seed.includes('"parent.hostel.manage"')],
["School Admin leave workspace mounted",admin.includes("<HostelLeaveWorkspace")],
["School Admin approval and denial controls",admin.includes("Approve & issue pass")&&admin.includes("Deny")],
["School Admin return checkin control",admin.includes("Verify return check-in")],
["School Admin notification log",admin.includes("Notification delivery log")],
["Parent mobile leave screen mounted",parentApp.includes("<HostelLeaveScreen")],
["Parent mobile consent controls",parentScreen.includes("Save notification consent")&&parentScreen.includes("Verified email notifications")],
["Parent mobile leave create and cancel",parentScreen.includes("Submit leave request")&&parentScreen.includes("Cancel request")],
["Parent mobile pending leave edit",parentScreen.includes("Edit pending request")&&parentScreen.includes('method:editingId?"PATCH":"POST"')],
["Parent mobile shows pass and return status",parentScreen.includes("Gate pass")&&parentScreen.includes("Checked in:")]
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?"PASS":"FAIL"} ${name}`);if(!ok)failed++;}
console.log(`P568 focused verifier: ${checks.length-failed}/${checks.length} PASS`);
if(failed)process.exit(1);
