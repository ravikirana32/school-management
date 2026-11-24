export type OutcomeCoverageRecord = {
  id: string;
  gradeLevelId: string;
  curriculumSubjectId?: string | null;
  reviewStatus?: string | null;
};
export type CoverageMappingRecord = { outcomeId: string; examId: string };
export type CoverageExamRecord = { id: string; gradeLevelId: string; subjectName: string; examName: string; status?: string | null };
export type CoverageSubjectRecord = { id: string; gradeLevelId: string; name: string; code?: string | null };
export type CoverageGradeRecord = { id: string; name: string; sequence?: number };
export function buildOutcomeCoverageDashboard(outcomes: OutcomeCoverageRecord[], mappings: CoverageMappingRecord[], exams: CoverageExamRecord[], subjects: CoverageSubjectRecord[], grades: CoverageGradeRecord[]) {
  const outcomeIds = new Set(outcomes.map(o => o.id));
  const validMappings = mappings.filter(m => outcomeIds.has(m.outcomeId));
  const mappingCountByOutcome = new Map<string, number>();
  const examsById = new Map(exams.map(e => [e.id, e]));
  const outcomeById = new Map(outcomes.map(o => [o.id, o]));
  for (const m of validMappings) mappingCountByOutcome.set(m.outcomeId, (mappingCountByOutcome.get(m.outcomeId) || 0) + 1);
  const subjectById = new Map(subjects.map(s => [s.id, s]));
  const gradeById = new Map(grades.map(g => [g.id, g]));
  const mappedOutcomeIds = new Set(validMappings.map(m => m.outcomeId));
  const mappedOutcomes = outcomes.filter(o => mappedOutcomeIds.has(o.id));
  const unmappedOutcomes = outcomes.filter(o => !mappedOutcomeIds.has(o.id));
  const multiMappedOutcomes = outcomes.filter(o => (mappingCountByOutcome.get(o.id) || 0) > 1);
  const gradeIds = [...new Set(outcomes.map(o => o.gradeLevelId))];
  const byGrade = gradeIds.map(gradeLevelId => {
    const gradeOutcomes = outcomes.filter(o => o.gradeLevelId === gradeLevelId);
    const gradeMapped = gradeOutcomes.filter(o => mappedOutcomeIds.has(o.id));
    const gradeUnmapped = gradeOutcomes.filter(o => !mappedOutcomeIds.has(o.id));
    const gradeMappings = validMappings.filter(m => gradeOutcomes.some(o => o.id === m.outcomeId));
    const gradeExamIds = new Set(gradeMappings.map(m => m.examId));
    const examRows = [...gradeExamIds].map(id => examsById.get(id)).filter((e): e is CoverageExamRecord => !!e);
    return { gradeLevelId, gradeName: gradeById.get(gradeLevelId)?.name || gradeLevelId, totalOutcomes: gradeOutcomes.length, mappedOutcomes: gradeMapped.length, unmappedOutcomes: gradeUnmapped.length, mappedExamCount: gradeExamIds.size, mappingCount: gradeMappings.length, coveragePercent: gradeOutcomes.length ? Math.round(gradeMapped.length * 100 / gradeOutcomes.length) : 0, exams: examRows };
  });
  const bySubject = subjects.filter(s => outcomes.some(o => o.curriculumSubjectId === s.id)).map(subject => {
    const subjectOutcomes = outcomes.filter(o => o.curriculumSubjectId === subject.id);
    const mapped = subjectOutcomes.filter(o => mappedOutcomeIds.has(o.id));
    const subjectMappings = validMappings.filter(m => subjectOutcomes.some(o => o.id === m.outcomeId));
    return { curriculumSubjectId: subject.id, subjectName: subject.name, subjectCode: subject.code || null, gradeLevelId: subject.gradeLevelId, totalOutcomes: subjectOutcomes.length, mappedOutcomes: mapped.length, unmappedOutcomes: subjectOutcomes.length - mapped.length, mappingCount: subjectMappings.length, examCount: new Set(subjectMappings.map(m => m.examId)).size, coveragePercent: subjectOutcomes.length ? Math.round(mapped.length * 100 / subjectOutcomes.length) : 0 };
  });
  const unmappedDetails = unmappedOutcomes.map(o => ({ id: o.id, gradeLevelId: o.gradeLevelId, gradeName: gradeById.get(o.gradeLevelId)?.name || o.gradeLevelId, code: (o as any).code, title: (o as any).title, curriculumSubjectId: o.curriculumSubjectId || null, subjectName: o.curriculumSubjectId ? subjectById.get(o.curriculumSubjectId)?.name || null : null, reviewStatus: o.reviewStatus || "DRAFT" }));
  const multiMappedDetails = multiMappedOutcomes.map(o => ({ id: o.id, code: (o as any).code, title: (o as any).title, gradeLevelId: o.gradeLevelId, gradeName: gradeById.get(o.gradeLevelId)?.name || o.gradeLevelId, mappingCount: mappingCountByOutcome.get(o.id) || 0 }));
  const byExam = exams.map(exam => {
    const mapped = outcomes.filter(o => validMappings.some(m => m.examId === exam.id && m.outcomeId === o.id));
    const eligible = outcomes.filter(o => o.gradeLevelId === exam.gradeLevelId && (!o.curriculumSubjectId || [subjectById.get(o.curriculumSubjectId)?.name, subjectById.get(o.curriculumSubjectId)?.code].filter(Boolean).some(v => String(v).trim().toLowerCase() === exam.subjectName.trim().toLowerCase())));
    return { examId: exam.id, examName: exam.examName, subjectName: exam.subjectName, gradeLevelId: exam.gradeLevelId, gradeName: gradeById.get(exam.gradeLevelId)?.name || exam.gradeLevelId, examStatus: exam.status || "—", mappedOutcomeCount: mapped.length, eligibleOutcomeCount: eligible.length, coveragePercent: eligible.length ? Math.round(mapped.length * 100 / eligible.length) : 0, outcomes: mapped.map(o => ({ id: o.id, code: (o as any).code, title: (o as any).title })) };
  });
  return { summary: { totalOutcomes: outcomes.length, mappedOutcomes: mappedOutcomes.length, unmappedOutcomes: unmappedOutcomes.length, multiMappedOutcomes: multiMappedOutcomes.length, totalMappings: validMappings.length, mappedExams: new Set(validMappings.map(m => m.examId)).size, coveragePercent: outcomes.length ? Math.round(mappedOutcomes.length * 100 / outcomes.length) : 0 }, byGrade, bySubject, byExam, unmapped: unmappedDetails, multiMapped: multiMappedDetails };
}
