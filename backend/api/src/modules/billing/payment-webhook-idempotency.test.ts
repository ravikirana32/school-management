import { describe, expect, it } from 'vitest';
import { classifyPaymentWebhookReplay } from './payment-webhook-idempotency.js';
const hashA = 'a'.repeat(64);
const hashB = 'b'.repeat(64);

describe('P72 payment webhook replay integrity', () => {
  it('classifies a first-seen provider event as new', () => {
    expect(classifyPaymentWebhookReplay(null, hashA)).toBe('NEW');
  });
  it('allows a retry only when payload bytes match and processing is incomplete', () => {
    expect(classifyPaymentWebhookReplay({ payloadHash: hashA, processedAt: null }, hashA)).toBe('RETRY_SAME_PAYLOAD');
  });
  it('acknowledges a processed event only when payload bytes match', () => {
    expect(classifyPaymentWebhookReplay({ payloadHash: hashA, processedAt: new Date() }, hashA)).toBe('DUPLICATE');
  });
  it('rejects provider event ID reuse with a different payload hash', () => {
    expect(classifyPaymentWebhookReplay({ payloadHash: hashA, processedAt: null }, hashB)).toBe('PAYLOAD_CONFLICT');
  });
  it('rejects malformed hashes', () => {
    expect(() => classifyPaymentWebhookReplay(null, 'not-a-hash')).toThrow('Invalid payment webhook payload hash');
  });
});
