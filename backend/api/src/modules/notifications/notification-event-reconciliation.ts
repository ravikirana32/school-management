import type { NotificationDeliveryEventType } from "./notification-webhook-contract.js";

const statePriority: Record<string, number> = {
  PENDING: 0, PROCESSING: 0, RETRY: 0, DELIVERED: 1, BOUNCED: 2, COMPLAINED: 3,
  CANCELLED: 4, DEAD_LETTER: 4,
};

/**
 * Decide whether an incoming provider event may update the outbox's canonical state.
 * Event rows are always retained separately; this function only protects the summary row.
 * Older events never regress state, and terminal feedback states outrank delivery success.
 */
export function shouldApplyNotificationDeliveryEvent(
  currentStatus: string,
  lastProviderEventAt: Date | null,
  incomingStatus: NotificationDeliveryEventType,
  occurredAt: Date,
): boolean {
  if (!Number.isFinite(occurredAt.getTime())) return false;
  if (lastProviderEventAt && occurredAt.getTime() < lastProviderEventAt.getTime()) return false;
  const currentPriority = statePriority[currentStatus] ?? 0;
  const incomingPriority = statePriority[incomingStatus] ?? 0;
  if (incomingPriority < currentPriority) return false;
  return true;
}
