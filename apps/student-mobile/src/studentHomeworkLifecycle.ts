export type StudentHomeworkStatus = 'NOT_SUBMITTED'|'SUBMITTED'|'RESUBMITTED'|'GRADED'|'OVERDUE'|'DUE_TODAY'|'UPCOMING'|'NO_DUE_DATE';
export type HomeworkLifecycleInput={dueAt?:string|null;submissionStatus?:string|null;graded?:boolean};
const SUBMITTED_STATUSES=new Set(['SUBMITTED','RESUBMITTED','RETURNED']);
export function classifyHomework(input:HomeworkLifecycleInput,now:Date=new Date()):StudentHomeworkStatus{
 const status=(input.submissionStatus||'').toUpperCase();
 if(input.graded||status==='GRADED')return 'GRADED';
 if(SUBMITTED_STATUSES.has(status))return status==='RESUBMITTED'?'RESUBMITTED':'SUBMITTED';
 if(!input.dueAt)return 'NO_DUE_DATE';
 const due=new Date(input.dueAt);
 if(Number.isNaN(due.getTime()))return 'NO_DUE_DATE';
 const todayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
 const dueDay=new Date(due.getFullYear(),due.getMonth(),due.getDate()).getTime();
 const tomorrowStart=todayStart+86400000;
 if(dueDay<todayStart)return 'OVERDUE';
 if(dueDay<tomorrowStart)return 'DUE_TODAY';
 return 'UPCOMING';
}
export function homeworkStatusLabel(status:StudentHomeworkStatus):string{
 const labels:Record<StudentHomeworkStatus,string>={NOT_SUBMITTED:'Not submitted',SUBMITTED:'Submitted',RESUBMITTED:'Resubmitted',GRADED:'Graded',OVERDUE:'Overdue',DUE_TODAY:'Due today',UPCOMING:'Upcoming',NO_DUE_DATE:'No due date'};
 return labels[status];
}
export function formatHomeworkDueDate(dueAt?:string|null):string{
 if(!dueAt)return 'No due date';
 const parsed=new Date(dueAt);
 if(Number.isNaN(parsed.getTime()))return 'Due date unavailable';
 return parsed.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
}
export function canEditHomework(submissionStatus?:string|null):boolean{return (submissionStatus||'').toUpperCase()!=='GRADED';}
export const STUDENT_HOMEWORK_ANSWER_MAX_LENGTH=10000;
