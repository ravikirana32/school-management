export function resolveReportCardNotificationRecipients(
  links: Array<{ guardianId: string; userId: string | null; canReceiveCommunications: boolean; guardianActive: boolean }>,
  consentedGuardianIds: ReadonlySet<string>,
  optedOutUserIds: ReadonlySet<string>
): string[] {
  const recipients = new Set<string>();
  for (const link of links) {
    if (!link.canReceiveCommunications || !link.guardianActive || !link.userId) continue;
    if (!consentedGuardianIds.has(link.guardianId) || optedOutUserIds.has(link.userId)) continue;
    recipients.add(link.userId);
  }
  return [...recipients];
}
