import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const schema=fs.readFileSync(path.join(root,"backend/api/prisma/schema.prisma"),"utf8");
const routes=fs.readFileSync(path.join(root,"backend/api/src/modules/hostel/hostel.routes.ts"),"utf8");
const ui=fs.readFileSync(path.join(root,"apps/school-admin/src/HostelWorkspace.tsx"),"utf8");
const migration=fs.readFileSync(path.join(root,"backend/api/prisma/migrations/20261124093000_p567_hostel_visitors_gate_pass/migration.sql"),"utf8");
const checks=[
["visitor model exists",schema.includes("model HostelVisitorVisit")],
["gate pass model exists",schema.includes("model HostelGatePass")],
["visitor model tenant organization",/model HostelVisitorVisit[\s\S]*?organizationId String/.test(schema)],
["visitor model tenant school",/model HostelVisitorVisit[\s\S]*?schoolId String/.test(schema)],
["visitor model resident allocation",/model HostelVisitorVisit[\s\S]*?allocationId String/.test(schema)],
["visitor model host building",/model HostelVisitorVisit[\s\S]*?buildingId String/.test(schema)],
["visitor name bounded",schema.includes('visitorName String @db.VarChar(120)')],
["identity type bounded",schema.includes('identityType String? @db.VarChar(40)')],
["identity last four only",schema.includes('identityLast4 String? @db.VarChar(4)')],
["visitor status lifecycle",schema.includes('status String @default("PENDING") @db.VarChar(24)')],
["visitor approval actor",schema.includes("approvedBy String?")],
["visitor checkin actor",schema.includes("checkedInBy String?")],
["visitor checkout actor",schema.includes("checkedOutBy String?")],
["visitor school status index",schema.includes("@@index([organizationId,schoolId,status,requestedAt])")],
["gate pass model tenant fields",/model HostelGatePass[\s\S]*?organizationId String[\s\S]*?schoolId String/.test(schema)],
["gate pass type",schema.includes("passType String @db.VarChar(24)")],
["gate pass visitor unique relation",schema.includes("visitorVisitId String? @unique")],
["gate pass resident allocation",/model HostelGatePass[\s\S]*?allocationId String/.test(schema)],
["gate pass leave request link",schema.includes("leaveRequestId String?")],
["gate pass unique code",schema.includes("passCode String @unique")],
["gate pass validity start",schema.includes("validFrom DateTime")],
["gate pass validity end",schema.includes("validUntil DateTime")],
["gate pass approval actor",/model HostelGatePass[\s\S]*?approvedBy String\?/.test(schema)],
["gate pass departure and return stamps",/model HostelGatePass[\s\S]*?departedAt DateTime\?[\s\S]*?returnedAt DateTime\?/.test(schema)],
["gate pass visitor relation cascade",schema.includes("visitorVisit HostelVisitorVisit? @relation")],
["visitor GET route",routes.includes('base+"/visitors"')],
["visitor create route",routes.includes('base+"/visitors",wrap(async(req,res)=>')],
["visitor decision route",routes.includes('base+"/visitors/:visitId/decision"')],
["visitor check-in route",routes.includes('base+"/visitors/:visitId/check-in"')],
["visitor check-out route",routes.includes('base+"/visitors/:visitId/check-out"')],
["visitor decisions allow approve deny block",routes.includes('z.enum(["APPROVED","DENIED","BLOCKED"])')],
["visitor active allocation validated",routes.includes('Active hostel resident not found')],
["visitor building derived from allocation",routes.includes("buildingId:allocation.bed.room.buildingId")],
["duplicate active visitor guarded",routes.includes("active visitor authorization already exists")],
["visitor pass time window required",routes.includes("A valid access window is required")],
["visitor pass validity checked on arrival",routes.includes("Visitor pass is not currently valid")],
["visitor checkin audit",routes.includes("HOSTEL_VISITOR_CHECKED_IN")],
["visitor checkout audit",routes.includes("HOSTEL_VISITOR_CHECKED_OUT")],
["resident outpass route",routes.includes('base+"/gate-passes/outpass"')],
["outpass requires existing approved leave",routes.includes('status:"APPROVED"')&&routes.includes("already-approved leave request is required")],
["outpass validity constrained to leave",routes.includes("Outpass validity must be within the approved leave window")],
["duplicate active outpass guarded",routes.includes("An active resident outpass already exists")],
["outpass decision revalidates approved leave",routes.includes("linked active resident and approved leave request must still be valid")],
["outpass approval revalidates approved leave window",routes.includes("Outpass validity no longer fits the approved leave window or has expired")],
["outpass departure route",routes.includes('base+"/gate-passes/:passId/depart"')],
["outpass return route",routes.includes('base+"/gate-passes/:passId/return"')],
["pass expiry handled",routes.includes('status:"EXPIRED"')],
["visitor and pass expiry synchronized",routes.includes('passType:"VISITOR",status:"APPROVED",validUntil:{lt:new Date()}')&&routes.includes('gatePass:{is:{status:"EXPIRED"}}')],
["outpass cannot be created with expired window",routes.includes("already-expired pass validity window")],
["tenant scope in visitor queries",routes.includes("organizationId:s.organizationId,schoolId:s.schoolId,allocationId:allocation.id")],
["visitor registration audit",routes.includes("HOSTEL_VISITOR_REGISTERED")],
["outpass audit lifecycle",routes.includes("HOSTEL_OUTPASS_REQUESTED")&&routes.includes("HOSTEL_RESIDENT_DEPARTED")&&routes.includes("HOSTEL_RESIDENT_RETURNED")],
["School Admin workspace mounted",ui.includes("<HostelVisitorGatePassWorkspace")],
["School Admin visitor approval UI",ui.includes("Approve with time window")],
["School Admin gate checkin/out UI",ui.includes("Gate check-in")&&ui.includes("Gate check-out")],
["School Admin outpass lifecycle UI",ui.includes("Create outpass request")&&ui.includes("Record departure")&&ui.includes("Record return")],
["migration visitor/gate tables",migration.includes('CREATE TABLE "HostelVisitorVisit"')&&migration.includes('CREATE TABLE "HostelGatePass"')]
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?"PASS":"FAIL"} ${name}`);if(!ok)failed++;}
console.log(`P567 focused verifier: ${checks.length-failed}/${checks.length} PASS`);
if(failed)process.exit(1);
