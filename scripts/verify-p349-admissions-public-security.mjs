import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const routes=fs.readFileSync(path.join(root,'backend/api/src/modules/admissions/admission.public.routes.ts'),'utf8');
const limiter=fs.readFileSync(path.join(root,'backend/api/src/modules/admissions/admission-public-rate-limit.ts'),'utf8');
const app=fs.readFileSync(path.join(root,'backend/api/src/app.ts'),'utf8');
const checks=[
 ['Public admissions router applies no-store cache policy',routes.includes('admissionPublicRouter.use')&&routes.includes('Cache-Control')&&routes.includes('no-store, no-cache, must-revalidate, private')],
 ['Public admissions responses disable legacy caching',routes.includes('Pragma')&&routes.includes('no-cache')&&routes.includes('Expires')&&routes.includes('"0"')],
 ['Public admissions responses suppress referrer leakage',routes.includes('Referrer-Policy')&&routes.includes('no-referrer')],
 ['Public route rate limit uses Redis-backed counter',limiter.includes("redis.call('INCR'")&&limiter.includes('PEXPIRE')],
 ['Rate limiter fails closed when Redis unavailable',limiter.includes('status(503)')&&limiter.includes('Public admissions service temporarily unavailable')],
 ['Rate limit scope includes org, school, route and IP',limiter.includes('${org}:${school}:${route}:${ip}')],
 ['Public application tracking token stored hashed',routes.includes('publicTrackingTokenHash:hash(token)')],
 ['Tracking token lookup tenant-scoped and expiry/revocation guarded',routes.includes('publicTrackingTokenHash:hash(token),publicTrackingTokenRevokedAt:null,publicTrackingTokenExpiresAt:{gt:new Date()}')],
 ['Applicant OTP uses bounded attempts and expiry',routes.includes('attempts:{lt:5}')&&routes.includes('expiresAt:{gt:now}')],
 ['Applicant account session uses hashed bearer token and expiry',routes.includes('tokenHash:hash(token)')&&routes.includes('expiresAt:new Date(Date.now()+60*60*1000)')],
 ['CORS origin allowlist enabled globally',app.includes('origin(origin, callback)')&&app.includes('corsOrigins.includes(origin)')],
 ['Security headers middleware enabled globally',app.includes('app.use(helmet())')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`P349 targeted checks: ${checks.length-failed}/${checks.length} PASS`);process.exit(failed?1:0);
