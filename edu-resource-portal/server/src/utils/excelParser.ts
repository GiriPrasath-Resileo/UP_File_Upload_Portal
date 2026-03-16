import * as XLSX from 'xlsx';
import { BulkUploadRowSchema, type BulkUploadRow } from '@edu-portal/shared';

const TEMPLATE_HEADERS = [
  'district',
  'block',
  'place',
  'board',
  'schoolName',
  'udiseCode',
  'medium',
  'classGrade',
  'subject',
  'sampleType',
  'gender',
  'dominantHand',
  'pdfFileName',
];

const SAMPLE_ROW = {
  district: 'Lucknow',
  block: 'Chinhat',
  place: 'Chinhat',
  board: 'UP_BOARD',
  schoolName: 'Government Primary School Chinhat',
  udiseCode: '09150101001',
  medium: 'HINDI',
  classGrade: 'Grade 3',
  subject: 'MATHS',
  sampleType: 'NOTEBOOKS',
  gender: 'MALE',
  dominantHand: 'RIGHT',
  pdfFileName: 'sample_001.pdf',
};

export function generateBulkTemplate(): Buffer {
  const wb = XLSX.utils.book_new();

  // Main data sheet
  const ws = XLSX.utils.json_to_sheet([SAMPLE_ROW], { header: TEMPLATE_HEADERS });

  // Style header row (bold) by adding a custom sheet style note
  ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 30 }));

  // Instructions sheet
  const instructions = [
    { Field: 'district', Description: 'Name of the district (e.g. Lucknow)', Required: 'Yes' },
    { Field: 'block', Description: 'Name of the block (e.g. Chinhat)', Required: 'Yes' },
    { Field: 'place', Description: 'Name of the place/village', Required: 'Yes' },
    { Field: 'board', Description: 'Board code (e.g. UP_BOARD, CBSE, ICSE)', Required: 'Yes' },
    { Field: 'schoolName', Description: 'Full name of the school', Required: 'Yes' },
    { Field: 'udiseCode', Description: '11-digit UDISE code', Required: 'Yes' },
    { Field: 'medium', Description: 'HINDI | ENGLISH | URDU | SANSKRIT', Required: 'Yes' },
    { Field: 'classGrade', Description: 'Grade 1 through Grade 10', Required: 'Yes' },
    { Field: 'subject', Description: 'HINDI | ENGLISH | MATHS | SCIENCE | SOCIAL_SCIENCE | SANSKRIT', Required: 'Yes' },
    { Field: 'sampleType', Description: 'NOTEBOOKS | WORKSHEETS | OBJECTIVE_ASSESSMENTS | SUBJECTIVE_ASSESSMENTS | CURSIVE_WRITING_NOTEBOOKS', Required: 'Yes' },
    { Field: 'gender', Description: 'MALE | FEMALE | OTHER', Required: 'Yes' },
    { Field: 'dominantHand', Description: 'RIGHT | LEFT | AMBIDEXTROUS', Required: 'Yes' },
    { Field: 'pdfFileName', Description: 'Name of the matching PDF file uploaded with this form (e.g. sample_001.pdf)', Required: 'Yes' },
  ];
  const wsInstructions = XLSX.utils.json_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 20 }, { wch: 70 }, { wch: 10 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Upload Data');
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

export interface ParsedRow {
  row: BulkUploadRow;
  rowIndex: number;
}

export interface ParseResult {
  valid: ParsedRow[];
  errors: { rowIndex: number; errors: string[] }[];
}

export function parseExcelBuffer(buffer: Buffer): ParseResult {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

  const valid: ParsedRow[] = [];
  const errors: { rowIndex: number; errors: string[] }[] = [];

  rawRows.forEach((raw, idx) => {
    const rowIndex = idx + 2; // 1-indexed + header row
    const result = BulkUploadRowSchema.safeParse({
      district:     String(raw['district'] ?? '').trim(),
      block:        String(raw['block'] ?? '').trim(),
      place:        String(raw['place'] ?? '').trim(),
      board:        String(raw['board'] ?? '').trim(),
      schoolName:   String(raw['schoolName'] ?? '').trim(),
      udiseCode:    String(raw['udiseCode'] ?? '').trim(),
      medium:       String(raw['medium'] ?? '').trim().toUpperCase(),
      classGrade:   String(raw['classGrade'] ?? '').trim(),
      subject:      String(raw['subject'] ?? '').trim().toUpperCase(),
      sampleType:   String(raw['sampleType'] ?? '').trim().toUpperCase(),
      gender:       String(raw['gender'] ?? '').trim().toUpperCase(),
      dominantHand: String(raw['dominantHand'] ?? '').trim().toUpperCase(),
      pdfFileName:  String(raw['pdfFileName'] ?? '').trim(),
    });

    if (result.success) {
      valid.push({ row: result.data, rowIndex });
    } else {
      errors.push({
        rowIndex,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      });
    }
  });

  return { valid, errors };
}
