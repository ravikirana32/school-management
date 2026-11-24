export type StoredPaymentWebhook = { payloadHash: string; processedAt: Date | null };
export type PaymentWebhookReplay = 'NEW' | 'RETRY_SAME_PAYLOAD' | 'DUPLICATE' | 'PAYLOAD_CONFLICT';

/** Provider event IDs are immutable: reusing an ID with different signed bytes is a conflict. */
export function classifyPaymentWebhookReplay(
  existing: StoredPaymentWebhook | null,
  incomingPayloadHash: string,
): PaymentWebhookReplay {
  if (!/^[a-f0-9]{64}$/i.test(incomingPayloadHash)) throw new Error('Invalid payment webhook payload hash');
  if (!existing) return 'NEW';
  if (existing.payloadHash.toLowerCase() !== incomingPayloadHash.toLowerCase()) return 'PAYLOAD_CONFLICT';
  return existing.processedAt ? 'DUPLICATE' : 'RETRY_SAME_PAYLOAD';
}
