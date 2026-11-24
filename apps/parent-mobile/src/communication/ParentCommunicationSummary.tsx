import React from "react";
import { Text, View } from "react-native";

type Notice = { category?: string | null; readAt?: string | null; createdAt?: string | null };
type Thread = { status?: string | null; lastMessageAt?: string | null; messages?: { createdAt?: string | null }[] };
export type ParentCommunicationSnapshot = { unreadNotifications: number; unreadByCategory: Record<string, number>; openThreads: number; latestActivityAt: string | null };

export function summarizeParentCommunication(notices: Notice[], threads: Thread[], serverUnreadCount?: number): ParentCommunicationSnapshot {
  const unread = notices.filter(n => !n.readAt);
  const unreadByCategory: Record<string, number> = {};
  for (const notice of unread) {
    const category = String(notice.category || "OTHER").trim().toUpperCase() || "OTHER";
    unreadByCategory[category] = (unreadByCategory[category] || 0) + 1;
  }
  const latestDates = [...notices.map(n => n.createdAt), ...threads.map(t => t.lastMessageAt), ...threads.flatMap(t => (t.messages || []).map(m => m.createdAt))]
    .filter((value): value is string => Boolean(value) && Number.isFinite(Date.parse(value as string)))
    .map(value => Date.parse(value as string));
  const latest = latestDates.length ? new Date(Math.max(...latestDates)).toISOString() : null;
  const validServerUnread = Number.isFinite(serverUnreadCount) && (serverUnreadCount as number) >= 0 ? Math.floor(serverUnreadCount as number) : unread.length;
  return { unreadNotifications: Math.max(unread.length, validServerUnread), unreadByCategory, openThreads: threads.filter(t => String(t.status || "").toUpperCase() === "OPEN").length, latestActivityAt: latest };
}
const tile = { borderWidth: 1, borderColor: "#d8deea", borderRadius: 9, padding: 10, minWidth: "30%" as const, flexGrow: 1 };
const number = { fontSize: 19, fontWeight: "800" as const, color: "#263246" };
const label = { fontSize: 12, color: "#667085" };
export function ParentCommunicationSummary({ notices, threads, unreadCount }: { notices: Notice[]; threads: Thread[]; unreadCount?: number }) {
  const snapshot = summarizeParentCommunication(notices, threads, unreadCount);
  const categories = Object.entries(snapshot.unreadByCategory).sort(([a], [b]) => a.localeCompare(b));
  return <View accessibilityLabel="Parent communication summary" style={{ gap: 8, marginBottom: 12 }}>
    <Text style={{ fontWeight: "700", fontSize: 16 }}>Communication snapshot</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <View style={tile}><Text style={number}>{snapshot.unreadNotifications}</Text><Text style={label}>Unread notifications</Text></View>
      <View style={tile}><Text style={number}>{snapshot.openThreads}</Text><Text style={label}>Open conversations</Text></View>
    </View>
    {categories.length ? <Text style={label}>Unread by category: {categories.map(([category, count]) => `${category.replaceAll("_", " ")} ${count}`).join(" · ")}</Text> : <Text style={label}>No unread notifications in the loaded list.</Text>}
    {snapshot.latestActivityAt ? <Text style={label}>Latest loaded communication: {new Date(snapshot.latestActivityAt).toLocaleString()}</Text> : null}
  </View>;
}
