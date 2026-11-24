import React from "react";
import { Text, View } from "react-native";

type AttendanceRow = { status?: string | null };
type HomeworkRow = { dueAt?: string | null; submission?: { status?: string | null; submittedAt?: string | null } | null };
type ReportCardRow = { publishedAt?: string | null; termLabel?: string | null; academicYearId?: string | null };
export type ParentAcademicActivitySnapshot = {
  attendanceTotal: number;
  present: number;
  absent: number;
  otherAttendance: number;
  assignmentsTotal: number;
  submitted: number;
  pending: number;
  overdue: number;
  reportCards: number;
  latestReportLabel: string | null;
};

export function summarizeParentAcademicActivity(attendance: AttendanceRow[], homework: HomeworkRow[], reportCards: ReportCardRow[], now = Date.now()): ParentAcademicActivitySnapshot {
  const normalized = (value?: string | null) => String(value || "").trim().toUpperCase();
  const present = attendance.filter(row => ["PRESENT", "LATE", "ON_TIME"].includes(normalized(row.status))).length;
  const absent = attendance.filter(row => ["ABSENT", "ABSENT_UNEXCUSED", "ABSENT_EXCUSED"].includes(normalized(row.status))).length;
  const submitted = homework.filter(row => Boolean(row.submission?.submittedAt) || ["SUBMITTED", "GRADED", "COMPLETED"].includes(normalized(row.submission?.status))).length;
  const pendingRows = homework.filter(row => !Boolean(row.submission?.submittedAt) && !["SUBMITTED", "GRADED", "COMPLETED"].includes(normalized(row.submission?.status)));
  const overdue = pendingRows.filter(row => row.dueAt && Number.isFinite(Date.parse(row.dueAt)) && Date.parse(row.dueAt) < now).length;
  const latest = [...reportCards].filter(row => row.publishedAt && Number.isFinite(Date.parse(row.publishedAt))).sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!))[0];
  return {
    attendanceTotal: attendance.length,
    present,
    absent,
    otherAttendance: Math.max(0, attendance.length - present - absent),
    assignmentsTotal: homework.length,
    submitted,
    pending: pendingRows.length,
    overdue,
    reportCards: reportCards.length,
    latestReportLabel: latest ? `${latest.termLabel || "Report card"}${latest.academicYearId ? ` · ${latest.academicYearId}` : ""}` : null,
  };
}

const tile = { borderWidth: 1, borderColor: "#d8deea", borderRadius: 9, padding: 10, minWidth: "30%" as const, flexGrow: 1, gap: 3 };
const number = { fontSize: 19, fontWeight: "800" as const, color: "#263246" };
const label = { fontSize: 12, color: "#667085" };

/** Consolidated parent-facing academic activity snapshot; underlying records remain in their detail sections. */
export function ParentAcademicActivitySummary({ attendance, homework, reportCards }: { attendance: AttendanceRow[]; homework: HomeworkRow[]; reportCards: ReportCardRow[] }) {
  const snapshot = summarizeParentAcademicActivity(attendance, homework, reportCards);
  return <View accessibilityLabel="Academic activity summary" style={{ gap: 8, marginBottom: 12 }}>
    <Text style={{ fontWeight: "700", fontSize: 16 }}>Academic activity snapshot</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <View style={tile}><Text style={number}>{snapshot.present}/{snapshot.attendanceTotal}</Text><Text style={label}>Attendance marked present</Text></View>
      <View style={tile}><Text style={number}>{snapshot.pending}</Text><Text style={label}>Pending assignments</Text></View>
      <View style={tile}><Text style={[number, snapshot.overdue > 0 ? { color: "#b42318" } : {}]}>{snapshot.overdue}</Text><Text style={label}>Overdue assignments</Text></View>
      <View style={tile}><Text style={number}>{snapshot.reportCards}</Text><Text style={label}>Published report cards</Text></View>
    </View>
    <Text style={label}>Assignment progress: {snapshot.submitted} submitted/completed · {snapshot.pending} pending</Text>
    {snapshot.latestReportLabel ? <Text style={label}>Latest report card: {snapshot.latestReportLabel}</Text> : null}
    {snapshot.attendanceTotal === 0 && snapshot.assignmentsTotal === 0 && snapshot.reportCards === 0 ? <Text style={label}>Academic activity will appear here when attendance, assignments or report cards are published.</Text> : null}
  </View>;
}
