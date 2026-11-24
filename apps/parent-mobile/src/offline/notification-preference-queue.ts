import type { PendingPreferenceIntent } from "./notification-preference-intent";

export type PreferenceSyncOutcome = {
  category: string;
  channel: string;
  enabled: boolean;
  savedAt: number;
  status: "synced" | "reconciled" | "failed" | "skipped";
  message: string;
};

/** Collapse duplicate intents by category/channel, keeping the newest timestamped intent. */
export function dedupePendingPreferenceIntents(intents: PendingPreferenceIntent[]): PendingPreferenceIntent[] {
  const latest = new Map<string, PendingPreferenceIntent>();
  for (const intent of intents) {
    if (!intent || typeof intent.category !== "string" || !intent.category.trim() ||
        typeof intent.channel !== "string" || !intent.channel.trim() ||
        typeof intent.enabled !== "boolean" || !Number.isFinite(intent.savedAt)) continue;
    const key = `${intent.category}:${intent.channel}`;
    const current = latest.get(key);
    if (!current || intent.savedAt >= current.savedAt) latest.set(key, intent);
  }
  return [...latest.values()].sort((a, b) => a.savedAt - b.savedAt);
}

/** Execute a queue sequentially; failures are isolated so later preferences can still sync. */
export async function runPreferenceSyncQueue(
  intents: PendingPreferenceIntent[],
  execute: (intent: PendingPreferenceIntent) => Promise<"synced" | "reconciled" | "skipped" | void>,
): Promise<PreferenceSyncOutcome[]> {
  const outcomes: PreferenceSyncOutcome[] = [];
  for (const intent of dedupePendingPreferenceIntents(intents)) {
    try {
      const result = await execute(intent);
      outcomes.push({ ...intent, status: result || "synced", message: result === "reconciled" ? "Already current on server." : result === "skipped" ? "Skipped by sync guard." : "Preference synchronized." });
    } catch (error) {
      outcomes.push({ ...intent, status: "failed", message: error instanceof Error ? error.message : "Preference synchronization failed." });
    }
  }
  return outcomes;
}
