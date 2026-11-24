export type NotificationChannelReadiness = {
  IN_APP: { available: true; reason: null };
  EMAIL: { available: boolean; reason: string | null };
  PUSH: { available: false; reason: string };
};
export function getNotificationChannelReadiness(config: { emailProviderUrl?: string; emailProviderToken?: string; emailFrom?: string }): NotificationChannelReadiness {
  const emailConfigured = Boolean(config.emailProviderUrl?.startsWith("https://") && config.emailProviderToken?.trim() && config.emailFrom?.trim());
  return {
    IN_APP: { available: true, reason: null },
    EMAIL: { available: emailConfigured, reason: emailConfigured ? null : "School email delivery provider is not fully configured." },
    PUSH: { available: false, reason: "Push delivery provider is not available yet." },
  };
}
