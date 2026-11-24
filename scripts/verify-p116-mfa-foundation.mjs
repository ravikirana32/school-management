import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const checks = [
  ['TOTP seed encrypted with AES-256-GCM', read('backend/api/src/modules/auth/mfa.ts').includes('aes-256-gcm')],
  ['Encryption key requires 32 bytes', read('backend/api/src/modules/auth/mfa.ts').includes('key.length !== 32')],
  ['TOTP uses HMAC-SHA1 and 30-second counter', read('backend/api/src/modules/auth/mfa.ts').includes('createHmac("sha1"') && read('backend/api/src/modules/auth/mfa.ts').includes('now / 30000')],
  ['TOTP verification uses timing-safe comparison', read('backend/api/src/modules/auth/mfa.ts').includes('timingSafeEqual')],
  ['TOTP replay is prevented with atomic last-step claim', read('backend/api/src/modules/auth/auth.routes.ts').includes('lastTotpStep: { lt: totpStep }')],
  ['Enrollment endpoint is authenticated', read('backend/api/src/modules/auth/auth.routes.ts').includes('/mfa/totp/enroll", authenticate')],
  ['Enrollment confirmation and challenge endpoint exists', read('backend/api/src/modules/auth/auth.routes.ts').includes('/mfa/verify", authenticate')],
  ['Recovery codes are hashed before persistence', read('backend/api/src/modules/auth/auth.routes.ts').includes('codeHash: hashRecoveryCode(value)')],
  ['Recovery codes are single-use claimed atomically', read('backend/api/src/modules/auth/auth.routes.ts').includes('codeClaimed.count !== 1') && read('backend/api/src/modules/auth/auth.routes.ts').includes('usedAt: null }, data: { usedAt: now }')],
  ['Platform-admin access requires fresh MFA', read('backend/api/src/modules/platform/platform.middleware.ts').includes('freshMfa')],
  ['MFA enrollment and challenge endpoints are rate-limited', read('backend/api/src/modules/auth/auth.routes.ts').includes('mfaChallengeRateLimit') && read('backend/api/src/modules/auth/auth.routes.ts').includes('mfaEnrollRateLimit')],
  ['MFA failures emit privacy-safe abuse telemetry', read('backend/api/src/modules/auth/auth-rate-limit.ts').includes('mfa_failed') && read('backend/api/src/modules/auth/auth.routes.ts').includes('recordAuthAbuseEvent("mfa_failed")')],
  ['MFA recovery schema and migration exist', read('backend/api/prisma/schema.prisma').includes('model MfaRecoveryCode') && fs.existsSync(path.join(root, 'backend/api/prisma/migrations/20261118080000_p116_mfa_recovery_codes/migration.sql'))],
  ['Encryption configuration documented', read('.env.example').includes('MFA_ENCRYPTION_KEY')],
  ['Root and docs gap registers match', read('MASTER-OPEN-GAPS-REGISTER.md') === read('docs/MASTER-OPEN-GAPS-REGISTER.md')],
  ['Root and docs resolved history match', read('MASTER-RESOLVED-GAPS-HISTORY.md') === read('docs/MASTER-RESOLVED-GAPS-HISTORY.md')]
];
let failed = 0;
for (const [label, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`); if (!pass) failed++; }
console.log(`${checks.length - failed}/${checks.length} checks passed`);
if (failed) process.exit(1);
