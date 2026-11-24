import React, { useEffect, useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";

type Preference = { category: string; channel: "IN_APP"; enabled: boolean };
const CATEGORIES = ["GENERAL", "REPORT_CARD", "HOMEWORK", "FEES", "ATTENDANCE", "ADMISSIONS"] as const;
const LABELS: Record<string, string> = { GENERAL: "School announcements", REPORT_CARD: "Report cards", HOMEWORK: "Homework", FEES: "Fees and payments", ATTENDANCE: "Attendance", ADMISSIONS: "Admissions" };
type Props = { api: string; organizationId: string; schoolId: string; token: string };

export function StudentNotificationPreferences({ api, organizationId, schoolId, token }: Props) {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const base = `/api/v1/students/me/${encodeURIComponent(organizationId)}/${encodeURIComponent(schoolId)}/notification-preferences`;
  const request = async (method: "GET" | "PUT", body?: Preference) => {
    const response = await fetch(`${api.replace(/\/+$/, "")}${base}`, { method, headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Preference request failed (${response.status})`);
    return payload.data;
  };
  const refresh = async () => { setBusy(true); setError(""); try { const rows = await request("GET"); setPreferences(Array.isArray(rows) ? rows : []); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load preferences"); } finally { setBusy(false); } };
  useEffect(() => { void refresh(); }, [api, organizationId, schoolId, token]);
  const enabled = (category: string) => preferences.find(p => p.category === category && p.channel === "IN_APP")?.enabled !== false;
  const update = async (category: typeof CATEGORIES[number], value: boolean) => { setBusy(true); setError(""); setMessage(""); try { const saved = await request("PUT", { category, channel: "IN_APP", enabled: value }); setPreferences(rows => { const old = rows.find(p => p.category === category && p.channel === "IN_APP"); return old ? rows.map(p => p.category === category && p.channel === "IN_APP" ? saved : p) : [...rows, saved]; }); setMessage(`${LABELS[category]} preference saved.`); } catch (e) { setError(e instanceof Error ? e.message : "Unable to save preference"); } finally { setBusy(false); } };
  return <View style={{ gap: 9 }} accessibilityLabel="Student notification preferences">
    <Text style={{ fontSize: 17, fontWeight: "700", color: "#172033" }}>Notification preferences</Text>
    <Text style={{ fontSize: 12, lineHeight: 18, color: "#667085" }}>Manage in-app notifications by category. Essential account and security notices may still be delivered. Email and push preferences are not available in this student screen yet.</Text>
    {CATEGORIES.map(category => <View key={category} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#d8deea", borderRadius: 8, padding: 10 }}>
      <View style={{ flex: 1, paddingRight: 8 }}><Text style={{ fontWeight: "700", color: "#263246" }}>{LABELS[category]}</Text><Text style={{ fontSize: 11, color: "#667085" }}>In-app notification</Text></View>
      <Switch accessibilityLabel={`${LABELS[category]} in-app notifications`} accessibilityState={{ checked: enabled(category), disabled: busy }} disabled={busy} value={enabled(category)} onValueChange={value => void update(category, value)} />
    </View>)}
    <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => void refresh()} style={{ borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 10, alignItems: "center" }}><Text style={{ color: "#254f91", fontWeight: "700" }}>{busy ? "Updating…" : "Refresh preferences"}</Text></TouchableOpacity>
    {!!error && <Text accessibilityRole="alert" style={{ color: "#a12626", fontSize: 12 }}>{error}</Text>}
    {!!message && <Text style={{ color: "#176b37", fontSize: 12 }}>{message}</Text>}
  </View>;
}
