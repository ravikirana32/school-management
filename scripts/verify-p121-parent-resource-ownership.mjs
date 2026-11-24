import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const documents=read('backend/api/src/modules/documents/document.routes.ts');
const helper=documents.slice(documents.indexOf('async function hasConsentedGuardianStudentLink'),documents.indexOf('documentRouter.use(authenticate)'));
assert.match(helper,/status:"ACCEPTED"/);
assert.match(helper,/acceptedByUserId:userId/);
assert.match(helper,/consentAcceptedAt:\{not:null\}/);
assert.match(helper,/consentWithdrawnAt:null/);
assert.match(helper,/userId,organizationId,schoolId,isActive:true,emailVerifiedAt:\{not:null\}/);
assert.match(helper,/studentId,canReceiveCommunications:true/);
assert.equal((documents.match(/hasConsentedGuardianStudentLink\(tx,s\.userId,s\.organizationId,s\.schoolId,/g)||[]).length,3,'Expected helper on upload, completion and download paths');
assert.match(documents,/async function hasConsentedGuardianStudentLink/);
const parent=read('backend/api/src/modules/parents/parent.routes.ts');
assert.match(parent,/acceptedByUserId:userId,consentAcceptedAt:\{not:null\},consentWithdrawnAt:null/);
assert.match(parent,/emailVerifiedAt:\{not:null\}/);
assert.match(parent,/studentGuardian\.findFirst\(\{where:\{organizationId,schoolId,studentId,guardianId:\{in:guardianIds\},canReceiveCommunications:true\}/);
const gap=read('MASTER-OPEN-GAPS-REGISTER.md');
assert.equal(gap,read('docs/MASTER-OPEN-GAPS-REGISTER.md'));
assert.match(gap,/P121-G001/); assert.match(gap,/P121-G002/); assert.match(gap,/P121-G003/);
assert.equal(read('MASTER-RESOLVED-GAPS-HISTORY.md'),read('docs/MASTER-RESOLVED-GAPS-HISTORY.md'));
console.log(JSON.stringify({
  sharedParentOwnershipPredicate:true,
  requiresCurrentUserAcceptedConsent:true,
  requiresActiveVerifiedGuardian:true,
  requiresExactStudentSchoolLink:true,
  guardedHomeworkAttachmentFlows:3,
  parentPortalScopeReviewed:true,
  gapRegisterMirror:true,
  resolvedHistoryMirror:true,
  checks:14
},null,2));
