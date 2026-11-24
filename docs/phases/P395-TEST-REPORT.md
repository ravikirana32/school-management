# P395 Test Report

## PASS
- P395 static source verifier: 12/12 assertions.
- Parser behavior: 5/5 runtime checks, executed extracted parser source in a sandbox.
  - quoted comma
  - escaped quotes
  - quoted embedded newline
  - CRLF row endings
  - malformed unterminated quoted-field rejection
- P370–P395 regression verifier sweep: all PASS.
- TypeScript syntax scan: 247 files, 0 parse errors.
- package.json syntax: PASS.
- ZIP: baseline preservation 100%, missing baseline paths 0, duplicate entries 0, integrity PASS.

## Not run
- Full TypeScript build or package install (no workspace dependencies present).
- API integration/runtime and authorization tests.
- Database migrations/RLS/runtime tests.
- Browser, mobile, email provider and end-to-end acceptance.

Static source checks and isolated parser behavior checks are not substitutes for the above runtime tests.
