import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOutcomeCoverageDashboard } from '../backend/api/src/modules/curriculum/outcome-coverage.ts';
const outcomes = [
 {id:'o1',gradeLevelId:'g1',curriculumSubjectId:'s1',reviewStatus:'APPROVED',code:'M1',title:'Counting'},
 {id:'o2',gradeLevelId:'g1',curriculumSubjectId:'s1',reviewStatus:'DRAFT',code:'M2',title:'Addition'},
 {id:'o3',gradeLevelId:'g1',curriculumSubjectId:null,reviewStatus:'IN_REVIEW',code:'G1',title:'Learning habits'},
 {id:'o4',gradeLevelId:'g2',curriculumSubjectId:'s2',reviewStatus:'APPROVED',code:'E1',title:'Plants'},
];
const mappings=[{outcomeId:'o1',examId:'e1'},{outcomeId:'o1',examId:'e2'},{outcomeId:'o3',examId:'e1'},{outcomeId:'o4',examId:'e3'},{outcomeId:'ghost',examId:'e1'}];
const exams=[{id:'e1',gradeLevelId:'g1',subjectName:'Mathematics',examName:'Math Midterm',status:'DRAFT'},{id:'e2',gradeLevelId:'g1',subjectName:'Math',examName:'Math Final',status:'PUBLISHED'},{id:'e3',gradeLevelId:'g2',subjectName:'Science',examName:'Science Quiz',status:'DRAFT'},{id:'e4',gradeLevelId:'g1',subjectName:'Mathematics',examName:'Math Practice',status:'DRAFT'}];
const subjects=[{id:'s1',gradeLevelId:'g1',name:'Mathematics',code:'MATH'},{id:'s2',gradeLevelId:'g2',name:'Science',code:'SCI'}];
const grades=[{id:'g1',name:'Grade 1',sequence:1},{id:'g2',name:'Grade 2',sequence:2}];
const d=buildOutcomeCoverageDashboard(outcomes,mappings,exams,subjects,grades);
test('summary correctly counts mapped, unmapped and multi-mapped outcomes',()=>{assert.deepEqual(d.summary,{totalOutcomes:4,mappedOutcomes:3,unmappedOutcomes:1,multiMappedOutcomes:1,totalMappings:4,mappedExams:3,coveragePercent:75});});
test('grade rows report coverage and exams',()=>{const g1=d.byGrade.find(x=>x.gradeLevelId==='g1');assert.equal(g1.totalOutcomes,3);assert.equal(g1.mappedOutcomes,2);assert.equal(g1.unmappedOutcomes,1);assert.equal(g1.coveragePercent,67);assert.equal(g1.mappedExamCount,2);});
test('subject coverage includes subject scoped outcomes only',()=>{const math=d.bySubject.find(x=>x.curriculumSubjectId==='s1');assert.equal(math.totalOutcomes,2);assert.equal(math.coveragePercent,50);});
test('exam rows include mapped and eligible counts',()=>{const e1=d.byExam.find(x=>x.examId==='e1');assert.equal(e1.mappedOutcomeCount,2);assert.equal(e1.eligibleOutcomeCount,3);assert.equal(e1.coveragePercent,67);});
test('unmapped list and multi-mapped details are actionable',()=>{assert.equal(d.unmapped[0].code,'M2');assert.equal(d.multiMapped[0].mappingCount,2);});
test('empty input safely reports zero coverage',()=>{const empty=buildOutcomeCoverageDashboard([],[],[],[],[]);assert.equal(empty.summary.coveragePercent,0);assert.equal(empty.summary.totalOutcomes,0);assert.equal(empty.byExam.length,0);});

test('exam without mappings is included with zero mapped coverage',()=>{const e4=d.byExam.find(x=>x.examId==='e4');assert.ok(e4);assert.equal(e4.mappedOutcomeCount,0);assert.equal(e4.coveragePercent,0);});
