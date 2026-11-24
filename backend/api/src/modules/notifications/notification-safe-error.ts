/** Return a deliberately small, PII-free summary for persisted worker diagnostics. */
export function safeNotificationFailureSummary(error: unknown): string {
  if (error instanceof Error) {
    const match = /^Notification provider returned HTTP (\d{3})$/.exec(error.message);
    if (match) return `Notification provider HTTP ${match[1]}`;
  }
  return "Notification provider transport failure";
}
