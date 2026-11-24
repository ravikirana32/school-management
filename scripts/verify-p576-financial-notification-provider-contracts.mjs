import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const signaturePath = 'backend/api/src/modules/billing/payment-webhook-signature.ts';
const routePath = 'backend/api/src/modules/billing/billing.routes.ts';
const testPath = 'backend/api/src/modules/billing/payment-webhook-signature.test.ts';
const signature = fs.readFileSync(path.join(root, signaturePath), 'utf8');
const route = fs.readFileSync(path.join(root, routePath), 'utf8');
const test = fs.readFileSync(path.join(root, testPath), 'utf8');
const checks = [
  ['payment signature helper exists', fs.existsSync(path.join(root, signaturePath))],
  ['HMAC-SHA256 used', signature.includes('createHmac("sha256"')],
  ['constant-time digest comparison used', signature.includes('timingSafeEqual')],
  ['timestamp is included in signed bytes', signature.includes('`${timestamp}.`')],
  ['five-minute replay default', signature.includes('toleranceSeconds = 300')],
  ['timestamp header fields are exact', signature.includes('Object.keys(parts).length !== 2')],
  ['duplicate signature fields rejected', signature.includes('Object.hasOwn(parts, key)')],
  ['timestamp numeric format constrained', signature.includes('/^\\d{1,12}$/')],
  ['digest hex format constrained', signature.includes('/^[a-f0-9]{64}$/i')],
  ['raw body size is bounded', signature.includes('rawBody.length > 64 * 1024')],
  ['short secrets rejected', signature.includes('secret.length < 32')],
  ['payment route uses timestamped helper', route.includes('verifyPaymentWebhookSignature(rawBody, signature, secret)')],
  ['provider identifier is validated', route.includes('Invalid payment provider identifier')],
  ['payment webhook payload size returns 413', route.includes('Webhook payload exceeds the 64 KB limit')],
  ['raw body signature is verified before schema processing', route.indexOf('if (!verifyPaymentWebhookSignature') < route.indexOf('webhookSchema.safeParse')],
  ['existing payload hash replay protection retained', route.includes('classifyPaymentWebhookReplay(existing, payloadHash)')],
  ['event ID payload conflict remains 409', route.includes('PAYLOAD_CONFLICT') && route.includes('status(409)')],
  ['provider reconciliation is not falsely simulated', route.includes('provider reconciliation adapter not configured')],
  ['signature tests cover replay window', test.includes('timestamps outside the replay window')],
  ['signature tests cover changed body and malformed headers', test.includes('rejects a changed body') && test.includes('malformed, duplicate and unknown header fields')],
];
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
console.log(`SUMMARY ${checks.filter(([, ok]) => ok).length}/${checks.length} contract checks`);
if (checks.some(([, ok]) => !ok)) process.exit(1);
