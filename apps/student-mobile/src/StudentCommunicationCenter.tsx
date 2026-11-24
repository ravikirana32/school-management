import React, { useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export type StudentCommunicationItem = {
  id: string;
  payload: { title?: string; body?: string; priority?: string; category?: string };
  readAt?: string | null;
  createdAt: string;
};

type Props = {
  items: StudentCommunicationItem[];
  busy?: boolean;
  onRefresh: () => void;
  onMarkRead: (id: string) => Promise<void>;
};


/** Student inbox with local search/read filtering; data remains server-owned. */
export function StudentCommunicationCenter({ items, busy = false, onRefresh, onMarkRead }: Props) {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [marking, setMarking] = useState<string | null>(null);
  const unreadCount = items.filter((item) => !item.readAt).length;
  const visibleItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      const isRead = Boolean(item.readAt);
      const matchesFilter = filter === "all" || (filter === "unread" ? !isRead : isRead);
      const searchable = `${item.payload?.title ?? ""} ${item.payload?.body ?? ""} ${item.payload?.category ?? ""} ${item.payload?.priority ?? ""}`.toLowerCase();
      return matchesFilter && (!needle || searchable.includes(needle));
    }).sort((a, b) => Date.parse(b.createdAt || "") - Date.parse(a.createdAt || ""));
  }, [items, filter, search]);

  const markOne = async (id: string) => {
    if (marking || busy) return;
    setMarking(id);
    try { await onMarkRead(id); } catch { /* Parent displays the API error; avoid an unhandled rejection. */ } finally { setMarking(null); }
  };

  return <View style={{ gap: 10 }}>
    <Text style={{ fontSize: 17, fontWeight: "700", color: "#172033" }}>School communications · {unreadCount} unread</Text>
    <TextInput accessibilityLabel="Search school communications" value={search} onChangeText={setSearch} placeholder="Search announcements" style={{ borderWidth: 1, borderColor: "#d8deea", borderRadius: 8, padding: 10, color: "#172033" }} />
    <View style={{ flexDirection: "row", gap: 6 }}>
      {(["all", "unread", "read"] as const).map((choice) => <TouchableOpacity key={choice} accessibilityRole="button" accessibilityState={{ selected: filter === choice }} onPress={() => setFilter(choice)} style={{ flex: 1, padding: 9, borderRadius: 8, backgroundColor: filter === choice ? "#254f91" : "#eef2f7", alignItems: "center" }}><Text style={{ fontWeight: "700", color: filter === choice ? "#fff" : "#254f91" }}>{choice === "all" ? "All" : choice === "unread" ? `Unread (${unreadCount})` : "Read"}</Text></TouchableOpacity>)}
    </View>
    {visibleItems.length === 0 ? <Text style={{ color: "#667085", paddingVertical: 8 }}>{items.length === 0 ? "No announcements available." : "No communications match this filter or search."}</Text> : visibleItems.map((item) => <View key={item.id} style={{ padding: 12, backgroundColor: item.readAt ? "#f8fafc" : "#f0f6ff", borderWidth: 1, borderColor: item.readAt ? "#d8deea" : "#c3d7f3", borderRadius: 9, gap: 5 }}>
      <Text style={{ fontWeight: "700", color: "#263246" }}>{item.payload?.title || "School announcement"}{item.readAt ? " · READ" : " · NEW"}</Text>
      <Text style={{ fontSize: 12, color: "#667085" }}>{item.createdAt?.slice(0, 10) || "Date unavailable"}{item.payload?.category ? ` · ${item.payload.category}` : ""}{item.payload?.priority ? ` · ${item.payload.priority}` : ""}</Text>
      <Text style={{ fontSize: 13, color: "#475467", lineHeight: 19 }}>{item.payload?.body || ""}</Text>
      {!item.readAt && <TouchableOpacity disabled={busy || marking !== null} onPress={() => void markOne(item.id)} style={{ alignSelf: "flex-start", paddingVertical: 7, paddingHorizontal: 10, borderRadius: 7, backgroundColor: "#e0ebfa" }}><Text style={{ color: "#254f91", fontWeight: "700" }}>{marking === item.id ? "Marking…" : "Mark as read"}</Text></TouchableOpacity>}
    </View>)}
    <TouchableOpacity disabled={busy} onPress={onRefresh} style={{ borderWidth: 1, borderColor: "#cbd5e1", padding: 10, borderRadius: 8, alignItems: "center" }}><Text style={{ color: "#254f91", fontWeight: "700" }}>{busy ? "Refreshing…" : "Refresh communications"}</Text></TouchableOpacity>
  </View>;
}
