import { readFileSync } from 'node:fs';
const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
const checks = [
  ['source-only-gates job exists', /source-only-gates:\s*\n\s+runs-on:/m],
  ['dependency-free source gate is invoked', /node scripts\/verify-c2-01-ci-source\.mjs/g],
  ['lockfile is explicitly required', /Require a committed workspace lockfile[\s\S]*?pnpm-lock\.yaml is missing/m],
  ['frozen lockfile installation is required', /pnpm install --frozen-lockfile/],
  ['Prisma generation is part of build gate', /prisma:generate/],
  ['API build is part of build gate', /@school-saas\/api build/],
  ['all nine applications have typecheck and build gates', /Typecheck API and all nine applications[\s\S]*@school-saas\/driver-mobile typecheck[\s\S]*Build API and all nine applications[\s\S]*@school-saas\/driver-mobile build/],
  ['production Compose configuration validation exists', /docker compose --env-file \.env\.prod -f docker-compose\.prod\.yml config --quiet/],
  ['filesystem security scan gate exists', /trivy-action[\s\S]*CRITICAL,HIGH[\s\S]*exit-code: "1"/],
];
let pass = 0;
for (const [label, pattern] of checks) {
  if (pattern.test(workflow)) { pass++; console.log(`PASS ${label}`); }
  else console.error(`FAIL ${label}`);
}
console.log(`CI workflow contract audit: ${pass}/${checks.length} PASS`);
if (pass !== checks.length) process.exit(1);
