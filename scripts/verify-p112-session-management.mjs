import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root,p),"utf8");
const routes = read("backend/api/src/modules/auth/auth.routes.ts");
const schema = read("backend/api/prisma/schema.prisma");
const gap = read("MASTER-OPEN-GAPS-REGISTER.md");
const migration = read("backend/api/prisma/migrations/20261118040000_p112_session_families_management/migration.sql");
const checks = [
  ["token family schema", schema.includes("tokenFamilyId       String?")],
  ["token family index", schema.includes("@@index([tokenFamilyId, status])")],
  ["refresh family assignment", routes.includes("tokenFamilyId: createOpaqueToken()")],
  ["predecessor linkage", routes.includes("replacedBySessionId: created.id")],
  ["reuse detection audit", routes.includes("auth.refresh_token.reuse_detected")],
  ["family-wide revocation", routes.includes("tokenFamilyId: session.tokenFamilyId, status: \"ACTIVE\"")],
  ["session inventory", routes.includes('authRouter.get("/sessions"')],
  ["owned session revocation", routes.includes('authRouter.delete("/sessions/:sessionId"') && routes.includes("userId: req.auth!.userId, status: \"ACTIVE\"")],
  ["revoke other sessions", routes.includes('authRouter.post("/sessions/revoke-others"')],
  ["migration column/index", migration.includes('ADD COLUMN "tokenFamilyId" TEXT') && migration.includes('"UserSession_tokenFamilyId_status_idx"')],
  ["P112 gap section", gap.includes("## P112 — Backend Refresh Token Families and Session Revocation")],
  ["gap mirror parity", read("docs/MASTER-OPEN-GAPS-REGISTER.md") === gap]
];
let failed=0; for (const [name,ok] of checks) { console.log(`${ok?"PASS":"FAIL"} ${name}`); if(!ok) failed++; }
if(failed) process.exit(1); console.log(`P112 source verifier: ${checks.length}/${checks.length} PASS`);
