import { z } from 'zod';

const PRIMARY_GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

const cursiveRefine = (d: { sampleType: string; classGrade: string }) =>
  d.sampleType !== 'CURSIVE_WRITING_NOTEBOOKS' || PRIMARY_GRADES.includes(d.classGrade);

const cursiveMsg = { message: 'Cursive writing notebooks are only for Grades 1–5', path: ['sampleType'] };

export const UploadBaseSchema = z.object({
  district:     z.string().min(1, 'District is required'),
  block:        z.string().min(1, 'Block is required'),
  place:        z.string().min(1, 'Place is required'),
  board:        z.string().min(1, 'Board is required'),
  schoolName:   z.string().min(1, 'School name is required'),
  udiseCode:    z.string().min(1, 'UDISE code is required'),
  medium:       z.enum(['HINDI', 'ENGLISH', 'URDU', 'SANSKRIT']),
  classGrade:   z.string().min(1, 'Class is required'),
  subject:      z.enum(['HINDI', 'ENGLISH', 'MATHS', 'SCIENCE', 'SOCIAL_SCIENCE', 'SANSKRIT']),
  sampleType:   z.enum(['NOTEBOOKS', 'WORKSHEETS', 'OBJECTIVE_ASSESSMENTS', 'SUBJECTIVE_ASSESSMENTS', 'CURSIVE_WRITING_NOTEBOOKS']),
  gender:       z.enum(['MALE', 'FEMALE', 'OTHER']),
  dominantHand: z.enum(['RIGHT', 'LEFT', 'AMBIDEXTROUS']),
});

export const UploadFormSchema = UploadBaseSchema.refine(cursiveRefine, cursiveMsg);

export type UploadFormData = z.infer<typeof UploadFormSchema>;

export const BulkUploadRowSchema = UploadBaseSchema.extend({
  pdfFileName: z.string().min(1, 'PDF file name is required'),
}).refine(cursiveRefine, cursiveMsg);

export type BulkUploadRow = z.infer<typeof BulkUploadRowSchema>;
