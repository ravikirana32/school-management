export type ReportCardSubjectResult = { code: string; components: Record<string, number> };
export function validateReportCardSubjects(schemaDefinition: unknown, subjects: ReportCardSubjectResult[]): "OK" | "SCHEMA" | "SUBJECT" | "SCORE" {
  if (!schemaDefinition || typeof schemaDefinition !== "object" || !Array.isArray((schemaDefinition as any).subjects)) return "SCHEMA";
  const allowed = new Map<string, any>((schemaDefinition as any).subjects.map((subject: any) => [subject?.code, subject]));
  for (const subject of subjects) {
    const spec = allowed.get(subject.code);
    if (!spec || !Array.isArray(spec.components)) return "SUBJECT";
    for (const component of spec.components) {
      const score = subject.components[component.key];
      if (typeof component.maxMarks !== "number" || !Number.isFinite(component.maxMarks) || component.maxMarks <= 0 || typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > component.maxMarks) return "SCORE";
    }
    if (Object.keys(subject.components).some(key => !spec.components.some((component: any) => component.key === key))) return "SCORE";
  }
  return "OK";
}
