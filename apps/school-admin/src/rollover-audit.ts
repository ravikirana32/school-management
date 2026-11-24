export type RolloverAuditRecord = {
  timestamp: string;
  rowNumber: number;
  admissionNumber: string;
  sourceAcademicYearId: string;
  targetAcademicYearId: string;
  targetGradeLevelId: string;
  targetSectionName: string;
  outcome: 'Created' | 'Failed' | 'Blocked' | 'Reconciled';
  detail: string;
};
const columns: (keyof RolloverAuditRecord)[] = ['timestamp','rowNumber','admissionNumber','sourceAcademicYearId','targetAcademicYearId','targetGradeLevelId','targetSectionName','outcome','detail'];
export function rolloverAuditCsv(records: RolloverAuditRecord[]): string {
  const cell=(value:unknown)=>{const text=String(value??'');return /[",\n\r]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;};
  const lines=[columns.join(','), ...records.map(record=>columns.map(key=>cell(record[key])).join(','))];
  return lines.join('\n');
}
export function createRolloverAuditRecord(row: {rowNumber:number; admissionNumber:string; currentAcademicYearId:string; targetAcademicYearId:string; targetGradeLevelId:string; targetSectionName:string}, outcome:RolloverAuditRecord['outcome'], detail:string, timestamp=new Date().toISOString()): RolloverAuditRecord {
  return {timestamp,rowNumber:row.rowNumber,admissionNumber:row.admissionNumber,sourceAcademicYearId:row.currentAcademicYearId,targetAcademicYearId:row.targetAcademicYearId,targetGradeLevelId:row.targetGradeLevelId,targetSectionName:row.targetSectionName,outcome,detail};
}
