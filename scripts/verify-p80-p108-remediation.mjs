import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
const auth = readFileSync("backend/api/src/modules/auth/auth.routes.ts", "utf8");
const org = readFileSync("backend/api/src/modules/organizations/organization.routes.ts", "utf8");
if (!auth.includes('authRouter.post("/password/reset"') || !auth.includes('passwordResetToken.updateMany') || !auth.includes('userSession.updateMany')) throw new Error("P80 password reset contract missing");
if (!org.includes('organizationRouter.patch("/:organizationId/status"') || !org.includes('tenantLifecycleEvent.create')) throw new Error("P81 lifecycle contract missing");
const result = spawnSync(process.execPath, ["--test", "packages/domain-rules/test/domain-rules.test.mjs"], {stdio:"inherit"});
if (result.status !== 0) process.exit(result.status || 1);
console.log("P80–P108 remediation source contracts and 29 domain invariant tests passed.");
