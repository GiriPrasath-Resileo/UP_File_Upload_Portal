import { buildS3Key } from '../utils/s3PathBuilder';

const baseParams = {
  state: 'UttarPradesh',
  district: 'Lucknow',
  block: 'Chinhat',
  place: 'Chinhat',
  board: 'UP_BOARD',
  school: 'GovtPrimarySchool',
  medium: 'HINDI',
  classGrade: 'Grade3',
  subject: 'MATHS',
  sampleType: 'NOTEBOOKS',
  gender: 'MALE',
  hand: 'RIGHT',
  fileNumber: 'UP-100001',
};

describe('buildS3Key', () => {
  it('builds correct path with 13 segments ending in .pdf', () => {
    const key = buildS3Key(baseParams);
    const parts = key.split('/');
    expect(parts).toHaveLength(13);
    expect(key.endsWith('.pdf')).toBe(true);
  });

  it('starts with slugified state', () => {
    const key = buildS3Key(baseParams);
    expect(key.startsWith('UttarPradesh/')).toBe(true);
  });

  it('ends with fileNumber.pdf', () => {
    const key = buildS3Key(baseParams);
    expect(key.endsWith('UP-100001.pdf')).toBe(false); // hyphen stripped
    expect(key.endsWith('UP100001.pdf')).toBe(true);
  });

  it('replaces spaces with underscores', () => {
    const key = buildS3Key({ ...baseParams, state: 'Uttar Pradesh', district: 'New District' });
    const parts = key.split('/');
    expect(parts[0]).toBe('Uttar_Pradesh');
    expect(parts[1]).toBe('New_District');
  });

  it("strips special characters (apostrophes, parentheses, !)", () => {
    const key = buildS3Key({
      ...baseParams,
      school: "St. Mary's School (Primary)!",
      place: "O'Brien Nagar",
    });
    const parts = key.split('/');
    // place is index 3, school is index 5
    expect(parts[3]).toBe('OBrien_Nagar');
    expect(parts[5]).toBe('St_Marys_School_Primary');
  });

  it('handles already-clean inputs unchanged', () => {
    const cleanParams = {
      state: 'UP',
      district: 'LKO',
      block: 'CHN',
      place: 'CHN',
      board: 'CBSE',
      school: 'DPS',
      medium: 'HINDI',
      classGrade: 'Grade3',
      subject: 'MATHS',
      sampleType: 'NOTEBOOKS',
      gender: 'MALE',
      hand: 'RIGHT',
      fileNumber: '100001',
    };
    const key = buildS3Key(cleanParams);
    expect(key).toBe('UP/LKO/CHN/CHN/CBSE/DPS/HINDI/Grade3/MATHS/NOTEBOOKS/MALE/RIGHT/100001.pdf');
  });

  it('handles empty string in optional segment gracefully (no crash)', () => {
    expect(() =>
      buildS3Key({ ...baseParams, place: '' })
    ).not.toThrow();

    const key = buildS3Key({ ...baseParams, place: '' });
    const parts = key.split('/');
    expect(parts[3]).toBe('');
  });
});
