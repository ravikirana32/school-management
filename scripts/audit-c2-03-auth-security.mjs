import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const root='backend/api/src/modules/auth';
const read=(file)=>readFileSync(join(root,file),'utf8');
const token=read('tokens.ts');
const middleware=read('auth.middleware.ts');
const security=read('security.ts');
const limiter=read('auth-rate-limit.ts');
const routes=read('auth.routes.ts');
const app=readFileSync('backend/api/src/app.ts','utf8');
const checks=[
 ['JWT algorithm allow-list',token.includes('algorithms: ["HS256"]')],
 ['JWT issuer and audience validation',token.includes('issuer')&&token.includes('audience')],
 ['JWT short access-token expiry',token.includes('setExpirationTime("10m")')],
 ['Signing-secret minimum length',token.includes('secret.length < 32')],
 ['Active session and expiry validation',middleware.includes('status: "ACTIVE"')&&middleware.includes('expiresAt: { gt: new Date() }')],
 ['Active user validation',middleware.includes('isActive: true')||middleware.includes('isActive')],
 ['MFA enrollment/challenge enforcement',middleware.includes('enforceRequiredMfa')&&middleware.includes('MFA_CHALLENGE_REQUIRED')],
 ['Argon2id password hashing',security.includes('argon2id')],
 ['Opaque token hashing',security.includes('hashOpaqueToken')&&security.includes('sha256')],
 ['Auth rate limiter uses Redis',limiter.includes('new Redis')&&limiter.includes('redis.eval')],
 ['Auth limiter fails closed',limiter.includes('Authentication service temporarily unavailable')],
 ['Auth abuse counters avoid identity fields',limiter.includes('fixed event labels')],
 ['Helmet security headers middleware',app.includes('helmet')&&app.includes('app.use(helmet())')],
 ['Auth route module present',existsSync(join(root,'auth.routes.ts'))&&routes.length>0],
 ['MFA implementation present',existsSync(join(root,'mfa.ts'))&&read('mfa.ts').length>0],
 ['Permissions implementation present',existsSync(join(root,'permissions.ts'))&&read('permissions.ts').length>0],
];
let pass=0;
for(const [name,ok] of checks){if(ok){pass++;console.log(`PASS ${name}`)}else console.error(`FAIL ${name}`)}
console.log(`C2-03 static authentication/security audit: ${pass}/${checks.length} PASS`);
console.log('Static source audit only; it does not prove runtime authorization, penetration-test, or deployment configuration outcomes.');
if(pass!==checks.length)process.exit(1);
