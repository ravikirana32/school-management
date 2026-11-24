import test from 'node:test';
import assert from 'node:assert/strict';
import * as r from '../src/index.mjs';
const cases = [
['password reset expiry',()=>assert.equal(r.passwordResetTokenUsable({consumedAt:null,expiresAt:'2099-01-01'},new Date('2026-01-01')),true)],
['closed org cannot reopen',()=>assert.equal(r.canTransitionOrganization('CLOSED','ACTIVE'),false)],
['permission wildcard',()=>assert.equal(r.permissionGranted(['students.*'],'students.read'),true)],
['subscription transition',()=>assert.equal(r.canTransitionSubscription('EXPIRED','ACTIVE'),false)],
['academic period',()=>assert.equal(r.validAcademicPeriod('2026-06-01','2027-03-31'),true)],
['seat capacity',()=>assert.equal(r.hasSeatCapacity({capacity:30,enrolled:20,reserved:9}),true)],
['student transition',()=>assert.equal(r.canTransitionStudent('COMPLETED','ACTIVE'),false)],
['assignment overlap',()=>assert.equal(r.assignmentsOverlap({start:'2026-01-01',end:'2026-01-10'},{start:'2026-01-10',end:'2026-01-20'}),true)],
['attendance correction',()=>assert.equal(r.attendanceCorrectionAllowed({status:'OPEN',withinWindow:true,approved:true}),true)],
['timetable conflict',()=>assert.equal(r.timetableConflict({day:1,start:10,end:11,teacherId:'t1'},{day:1,start:10.5,end:11.5,teacherId:'t1'}),true)],
['balanced journal',()=>assert.equal(r.journalBalanced([{debit:10,credit:0},{debit:0,credit:10}]),true)],
['payment invariant',()=>assert.equal(r.paymentAmountValid({amount:100,paid:80,refunded:20}),true)],
['late submission',()=>assert.equal(r.submissionIsLate('2026-01-02','2026-01-01'),true)],
['percentage',()=>assert.equal(r.calculatePercentage(45,50),90)],
['guardian privacy',()=>assert.equal(r.guardianCanAccessStudent({guardianLinked:true,consentActive:false,studentActive:true}),false)],
['retry ceiling',()=>assert.equal(r.retryAllowed({attempt:3,maxAttempts:3,retryable:true}),false)],
['geofence',()=>assert.equal(r.insideGeofence({distanceMeters:20,radiusMeters:50}),true)],
['stock cannot go negative',()=>assert.equal(r.stockAfterAdjustment(2,-3),null)],
['payroll net',()=>assert.equal(r.payrollNet({gross:1000,deductions:125}),875)],
['report range cap',()=>assert.equal(r.validReportRange('2026-01-01','2027-01-01',366),true)],
];
for (const [name,fn] of cases) test(name,fn);
