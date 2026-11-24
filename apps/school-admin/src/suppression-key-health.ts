export type SuppressionKeyHealthPayload = {
  currentVersion: string;
  previousVersion: string | null;
  aliases: { version: string; status: string; count: number }[];
  outboxReferences: { version: string | null; status: string; count: number }[];
};

export function buildSuppressionKeyHealthRows(payload: SuppressionKeyHealthPayload) {
  const versions = Array.from(new Set([payload.currentVersion, payload.previousVersion, ...payload.aliases.map(item => item.version), ...payload.outboxReferences.map(item => item.version).filter((value): value is string => Boolean(value))].filter((value): value is string => Boolean(value))));
  return versions.map(version => ({
    version,
    isCurrent: version === payload.currentVersion,
    isPrevious: version === payload.previousVersion,
    activeAliases: payload.aliases.filter(item => item.version === version && item.status === "ACTIVE").reduce((sum, item) => sum + item.count, 0),
    releasedAliases: payload.aliases.filter(item => item.version === version && item.status === "RELEASED").reduce((sum, item) => sum + item.count, 0),
    outboxReferences: payload.outboxReferences.filter(item => item.version === version).reduce((sum, item) => sum + item.count, 0),
  }));
}
