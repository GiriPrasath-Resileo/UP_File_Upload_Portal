import { describe, it, expect } from 'vitest';
import {
  GRADES,
  SUBJECTS,
  SAMPLE_TYPES,
  MEDIUMS,
  GENDERS,
  HANDS,
  PRIMARY_GRADES,
  STATUS_LABELS,
  ROLES,
} from './constants';

describe('constants', () => {
  it('GRADES has 10 entries', () => {
    expect(GRADES).toHaveLength(10);
    expect(GRADES[0]).toEqual({ value: 'Grade 1', label: 'Grade 1' });
  });

  it('SUBJECTS has expected entries', () => {
    expect(SUBJECTS).toContainEqual({ value: 'HINDI', label: 'Hindi' });
    expect(SUBJECTS).toContainEqual({ value: 'MATHS', label: 'Maths' });
  });

  it('SAMPLE_TYPES includes NOTEBOOKS and CURSIVE_WRITING_NOTEBOOKS', () => {
    expect(SAMPLE_TYPES).toContainEqual({ value: 'NOTEBOOKS', label: 'Notebooks' });
    expect(SAMPLE_TYPES).toContainEqual({ value: 'CURSIVE_WRITING_NOTEBOOKS', label: 'Cursive Writing Notebooks' });
  });

  it('MEDIUMS has HINDI, ENGLISH, URDU, SANSKRIT', () => {
    expect(MEDIUMS.map(m => m.value)).toEqual(['HINDI', 'ENGLISH', 'URDU', 'SANSKRIT']);
  });

  it('GENDERS has MALE, FEMALE, OTHER', () => {
    expect(GENDERS.map(g => g.value)).toEqual(['MALE', 'FEMALE', 'OTHER']);
  });

  it('HANDS has RIGHT, LEFT, AMBIDEXTROUS', () => {
    expect(HANDS.map(h => h.value)).toEqual(['RIGHT', 'LEFT', 'AMBIDEXTROUS']);
  });

  it('PRIMARY_GRADES are Grades 1-5', () => {
    expect(PRIMARY_GRADES).toEqual(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']);
  });

  it('STATUS_LABELS maps status codes', () => {
    expect(STATUS_LABELS.PENDING).toBe('Pending');
    expect(STATUS_LABELS.COMPLETED).toBe('Completed');
    expect(STATUS_LABELS.FAILED).toBe('Failed');
  });

  it('ROLES has ADMIN and UPLOADER', () => {
    expect(ROLES).toContainEqual({ value: 'ADMIN', label: 'Admin' });
    expect(ROLES).toContainEqual({ value: 'UPLOADER', label: 'Uploader' });
  });
});
