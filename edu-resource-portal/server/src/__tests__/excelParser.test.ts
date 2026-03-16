import * as XLSX from 'xlsx';
import { generateBulkTemplate, parseExcelBuffer } from '../utils/excelParser';

describe('generateBulkTemplate', () => {
  it('returns a Buffer', () => {
    const result = generateBulkTemplate();
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('returns a non-empty Buffer', () => {
    const result = generateBulkTemplate();
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns a valid xlsx workbook', () => {
    const result = generateBulkTemplate();
    expect(() => XLSX.read(result, { type: 'buffer' })).not.toThrow();
  });

  it('workbook contains an "Upload Data" sheet', () => {
    const result = generateBulkTemplate();
    const wb = XLSX.read(result, { type: 'buffer' });
    expect(wb.SheetNames).toContain('Upload Data');
  });

  it('workbook contains an "Instructions" sheet', () => {
    const result = generateBulkTemplate();
    const wb = XLSX.read(result, { type: 'buffer' });
    expect(wb.SheetNames).toContain('Instructions');
  });

  it('Upload Data sheet has a sample row', () => {
    const result = generateBulkTemplate();
    const wb = XLSX.read(result, { type: 'buffer' });
    const ws = wb.Sheets['Upload Data'];
    const rows = XLSX.utils.sheet_to_json(ws);
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });
});

describe('parseExcelBuffer', () => {
  function makeSingleRowBuffer(row: Record<string, string>): Buffer {
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }

  const validRow = {
    district: 'Lucknow',
    block: 'Chinhat',
    place: 'Chinhat',
    board: 'UP_BOARD',
    schoolName: 'Government Primary School',
    udiseCode: '09150101001',
    medium: 'HINDI',
    classGrade: 'Grade 3',
    subject: 'MATHS',
    sampleType: 'NOTEBOOKS',
    gender: 'MALE',
    dominantHand: 'RIGHT',
    pdfFileName: 'sample_001.pdf',
  };

  it('returns ParseResult with valid and errors arrays', () => {
    const buf = makeSingleRowBuffer(validRow);
    const result = parseExcelBuffer(buf);
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.valid)).toBe(true);
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('parses a valid row successfully', () => {
    const buf = makeSingleRowBuffer(validRow);
    const result = parseExcelBuffer(buf);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.valid[0].row.district).toBe('Lucknow');
    expect(result.valid[0].row.pdfFileName).toBe('sample_001.pdf');
    expect(result.valid[0].rowIndex).toBe(2);
  });

  it('reports error for row with missing required field', () => {
    const invalidRow = { ...validRow, medium: 'INVALID_MEDIUM' };
    const buf = makeSingleRowBuffer(invalidRow);
    const result = parseExcelBuffer(buf);
    expect(result.errors).toHaveLength(1);
    expect(result.valid).toHaveLength(0);
    expect(result.errors[0].rowIndex).toBe(2);
  });

  it('reports error for cursive writing notebook with Grade 6', () => {
    const cursiveInvalid = {
      ...validRow,
      sampleType: 'CURSIVE_WRITING_NOTEBOOKS',
      classGrade: 'Grade 6',
    };
    const buf = makeSingleRowBuffer(cursiveInvalid);
    const result = parseExcelBuffer(buf);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].errors[0]).toContain('Cursive writing notebooks are only for Grades 1');
  });

  it('handles empty buffer gracefully (no rows = empty result)', () => {
    const ws = XLSX.utils.aoa_to_sheet([['district', 'block']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
    const result = parseExcelBuffer(buf);
    expect(result.valid).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});
