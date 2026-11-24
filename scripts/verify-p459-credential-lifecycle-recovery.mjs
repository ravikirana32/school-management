import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd().endsWith('backend/api') ? path.resolve(process.cwd(), '../..') : process.cwd();
const routes = fs.readFileSync(path.join(root, 'backend/api/src/modules/auth/auth.routes.ts'), 'utf8');
const limits = fs.readFileSync(path.join(root, 'backend/api/src/modules/auth/auth-rate-limit.ts'), 'utf8');
const schema = fs.readFileSync(path.join(root, 'backend/api/prisma/schema.prisma'), 'utf8');
const inventoryPath = path.join(root, 'docs/phases/P459-credential-lifecycle-recovery-audit.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const checks = [
  ['forgot-password route generic response exists', routes.includes('authRouter.post("/password/forgot"') && routes.includes('If the account exists, reset instructions will be sent.')],
  ['reset route validates token and password length', routes.includes('token.length < 32') && routes.includes('password.length < 12')],
  ['opaque reset token is hashed before lookup', routes.includes('const tokenHash = hashOpaqueToken(token)')],
  ['reset token expiry and consumption checked', routes.includes('reset.consumedAt || reset.expiresAt <= now')],
  ['single-use token claimed with conditional update', routes.includes('consumedAt: null, expiresAt: { gt: now }') && routes.includes('claimed.count !== 1')],
  ['password hash update and active-session revocation exist', routes.includes('passwordHash: await hashPassword(password)') && routes.includes('status: "REVOKED", revokedAt: now')],
  ['password reset completion audit event exists', routes.includes('auth.password_reset.completed')],
  ['forgot-password IP/account rate limits present', limits.includes('password-forgot-ip') && limits.includes('limit: 5') && limits.includes('password-forgot-account') && limits.includes('limit: 3')],
  ['reset endpoint IP rate limit present', limits.includes('password-reset-ip') && limits.includes('limit: 10')],
  ['reset token schema stores hash and lifecycle fields', schema.includes('model PasswordResetToken') && schema.includes('tokenHash  String    @unique') && schema.includes('expiresAt  DateTime') && schema.includes('consumedAt DateTime?')],
  ['inventory documents delivery disabled and runtime not performed', inventory.evidenceType === 'static-source-inventory' && inventory.runtimeValidation === 'NOT_PERFORMED' && inventory.observations.some(o => o.id === 'P459-O06')]
];
let passed = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}: ${label}`); if (ok) passed++; }
console.log(`P459 verifier: ${passed}/${checks.length} passed`);
if (passed !== checks.length) process.exit(1);
