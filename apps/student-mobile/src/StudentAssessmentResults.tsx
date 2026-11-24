import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

type Exam = {
  id: string;
  examName: string;
  subjectName: string;
  examDate: string;
  maxMarks: number;
  passMarks: number;
  score: number | null;
  remarks?: string | null;
  percentage: number | null;
  status: string;
};

type Report = {
  id: string;
  academicYearId: string;
  termLabel: string;
  resultSummary: Record<string, unknown>;
  teacherRemarks?: string | null;
  principalRemarks?: string | null;
  publishedAt: string;
};

type Props = { api: string; token: string; organizationId: string; schoolId: string };


export function StudentAssessmentResults({ api, token, organizationId, schoolId }: Props) {
  const [tab, setTab] = useState<'exams' | 'reports'>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const base = `${api.replace(/\/+$/, '')}/api/v1/students/me/${encodeURIComponent(organizationId)}/${encodeURIComponent(schoolId)}`;
      const path = tab === 'exams' ? `${base}/exams` : `${base}/report-cards`;
      const response = await fetch(path, { headers: { authorization: `Bearer ${token}` } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Unable to load ${tab} (${response.status})`);
      if (tab === 'exams') setExams(body.data || []);
      else setReports(body.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : `Unable to load ${tab}`);
    } finally {
      setLoading(false);
    }
  }, [api, token, organizationId, schoolId, tab]);

  useEffect(() => { void load(); }, [load]);

  return (
    <View style={s.card}>
      <Text style={s.title}>Exams & results</Text>
      <View style={s.tabs}>
        {(['exams', 'reports'] as const).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[s.tab, tab === t && s.active]}>
            <Text style={[s.tabText, tab === t && s.activeText]}>{t === 'exams' ? 'Exam results' : 'Report cards'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? <ActivityIndicator accessibilityLabel="Loading assessments" /> : null}
      {error ? (
        <View style={s.error}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => void load()}><Text style={s.retry}>Retry</Text></TouchableOpacity>
        </View>
      ) : null}
      {!loading && !error && tab === 'exams' ? (
        exams.length ? exams.map((exam) => (
          <View key={exam.id} style={s.item}>
            <Text style={s.strong}>{exam.examName} · {exam.subjectName}</Text>
            <Text style={s.muted}>{exam.examDate.slice(0, 10)} · {exam.score === null ? 'Result not released' : `${exam.score} / ${exam.maxMarks}`}</Text>
            {exam.percentage !== null ? <Text style={s.score}>{exam.percentage.toFixed(1)}%</Text> : null}
            {exam.remarks ? <Text style={s.muted}>{exam.remarks}</Text> : null}
          </View>
        )) : <Text style={s.muted}>No published exam results available.</Text>
      ) : null}
      {!loading && !error && tab === 'reports' ? (
        reports.length ? reports.map((report) => (
          <View key={report.id} style={s.item}>
            <Text style={s.strong}>{report.termLabel}</Text>
            <Text style={s.muted}>Published {report.publishedAt.slice(0, 10)}</Text>
            <Text>{JSON.stringify(report.resultSummary)}</Text>
            {report.teacherRemarks ? <Text style={s.muted}>Teacher: {report.teacherRemarks}</Text> : null}
            {report.principalRemarks ? <Text style={s.muted}>Principal: {report.principalRemarks}</Text> : null}
          </View>
        )) : <Text style={s.muted}>No published report cards available.</Text>
      ) : null}
      <TouchableOpacity disabled={loading} onPress={() => void load()} style={s.refresh}>
        <Text style={s.refreshText}>Refresh {tab}</Text>
      </TouchableOpacity>
    </View>
  );
}


const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e3e8f0', padding: 14, gap: 10 },
  title: { fontSize: 17, fontWeight: '700', color: '#172033' },
  tabs: { flexDirection: 'row', gap: 6 },
  tab: { paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#d8deea', borderRadius: 8, flex: 1, alignItems: 'center' },
  active: { backgroundColor: '#254f91', borderColor: '#254f91' },
  tabText: { fontSize: 12, color: '#254f91', fontWeight: '700' },
  activeText: { color: 'white' },
  item: { padding: 11, borderWidth: 1, borderColor: '#d8deea', borderRadius: 9, gap: 4 },
  strong: { fontWeight: '700', color: '#263246' },
  muted: { fontSize: 12, color: '#667085' },
  score: { fontSize: 20, fontWeight: '800', color: '#254f91' },
  error: { backgroundColor: '#fff0f0', padding: 10, borderRadius: 8 },
  errorText: { color: '#a12626' },
  retry: { color: '#254f91', fontWeight: '700', marginTop: 5 },
  refresh: { borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 8, alignItems: 'center' },
  refreshText: { color: '#254f91', fontWeight: '700' },
});
