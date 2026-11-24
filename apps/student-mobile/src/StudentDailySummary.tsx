import React from "react";
import { StyleSheet, Text, View } from "react-native";

type HomeworkSummaryItem = { dueAt?: string | null; submission?: { status?: string | null } | null };
type AnnouncementSummaryItem = { readAt?: string | null };
export type StudentDailySummaryProps = { homework: HomeworkSummaryItem[]; announcements: AnnouncementSummaryItem[] };


/** A lightweight snapshot derived only from the student's currently loaded, school-scoped data. */
export function summarizeStudentDailyActivity(homework: HomeworkSummaryItem[], announcements: AnnouncementSummaryItem[], now = new Date()) {
  const dueTodayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  let pending = 0, overdue = 0, submitted = 0, graded = 0;
  for (const item of homework) {
    const status = String(item.submission?.status || "").trim().toUpperCase();
    if (status === "GRADED") { graded++; continue; }
    if (["SUBMITTED", "TURNED_IN", "COMPLETED"].includes(status)) { submitted++; continue; }
    pending++;
    if (item.dueAt) {
      const due = new Date(item.dueAt);
      if (!Number.isNaN(due.getTime()) && due.toISOString().slice(0, 10) < dueTodayKey) overdue++;
    }
  }
  return { pending, overdue, submitted, graded, unreadAnnouncements: announcements.filter(item => !item.readAt).length, totalHomework: homework.length };
}

export function StudentDailySummary({ homework, announcements }: StudentDailySummaryProps) {
  const summary = summarizeStudentDailyActivity(homework, announcements);
  return <View style={styles.card} accessibilityLabel="Student daily activity summary">
    <Text style={styles.heading}>My daily overview</Text>
    <View style={styles.grid}>
      <Metric label="Pending" value={summary.pending} />
      <Metric label="Overdue" value={summary.overdue} emphasis={summary.overdue > 0} />
      <Metric label="Submitted" value={summary.submitted} />
      <Metric label="Graded" value={summary.graded} />
      <Metric label="Unread notices" value={summary.unreadAnnouncements} />
    </View>
    <Text style={styles.caption}>{summary.totalHomework} published assignment(s) loaded for this school.</Text>
  </View>;
}
function Metric({ label, value, emphasis = false }: { label: string; value: number; emphasis?: boolean }) {
  return <View style={styles.metric} accessibilityLabel={`${label}: ${value}`}><Text style={[styles.value, emphasis && styles.alert]}>{value}</Text><Text style={styles.label}>{label}</Text></View>;
}
const styles = StyleSheet.create({ card: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e3e8f0", padding: 16, gap: 10 }, heading: { fontSize: 17, fontWeight: "700", color: "#172033" }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, metric: { minWidth: 82, flexGrow: 1, borderWidth: 1, borderColor: "#d8deea", borderRadius: 9, padding: 10, alignItems: "center" }, value: { fontSize: 22, fontWeight: "800", color: "#254f91" }, alert: { color: "#a12626" }, label: { fontSize: 11, color: "#667085", textAlign: "center" }, caption: { fontSize: 12, color: "#667085" } });
