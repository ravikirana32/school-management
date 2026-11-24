import { describe, expect, it } from 'vitest';
import { canTransitionStudent, isStudentExitStatus } from './student-lifecycle.js';

describe('P73 student lifecycle transitions', () => {
  it('allows applicant admission and active student exit transitions', () => {
    expect(canTransitionStudent('APPLICANT', 'ACTIVE')).toBe(true);
    expect(canTransitionStudent('ACTIVE', 'TRANSFERRED')).toBe(true);
    expect(canTransitionStudent('ACTIVE', 'GRADUATED')).toBe(true);
  });
  it('allows controlled reactivation from inactive only', () => {
    expect(canTransitionStudent('INACTIVE', 'ACTIVE')).toBe(true);
    expect(canTransitionStudent('TRANSFERRED', 'ACTIVE')).toBe(false);
    expect(canTransitionStudent('WITHDRAWN', 'ACTIVE')).toBe(false);
  });
  it('does not allow terminal records to become active again', () => {
    for (const status of ['TRANSFERRED', 'GRADUATED', 'WITHDRAWN', 'ARCHIVED'] as const) {
      expect(canTransitionStudent(status, 'ACTIVE')).toBe(false);
    }
  });
  it('marks only transfer, graduation and withdrawal as leaving events', () => {
    expect(isStudentExitStatus('TRANSFERRED')).toBe(true);
    expect(isStudentExitStatus('GRADUATED')).toBe(true);
    expect(isStudentExitStatus('WITHDRAWN')).toBe(true);
    expect(isStudentExitStatus('INACTIVE')).toBe(false);
  });
});
