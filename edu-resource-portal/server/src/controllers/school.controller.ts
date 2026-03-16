import type { Request, Response, NextFunction } from 'express';
import * as schoolService from '../services/school.service';
import { SchoolMappingSchema } from '@edu-portal/shared';
import * as XLSX from 'xlsx';

export async function getDistricts(_req: Request, res: Response, next: NextFunction) {
  try { res.json(await schoolService.getDistricts()); } catch (err) { next(err); }
}

export async function getBlocks(req: Request, res: Response, next: NextFunction) {
  try { res.json(await schoolService.getBlocks(req.params.district)); } catch (err) { next(err); }
}

export async function getSchools(req: Request, res: Response, next: NextFunction) {
  try {
    const { district, block } = req.params;
    res.json(await schoolService.getSchools(district, block));
  } catch (err) { next(err); }
}

export async function listAllSchools(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, district } = req.query as Record<string, string>;
    res.json(await schoolService.getAllSchools({
      page:   page   ? parseInt(page)   : undefined,
      limit:  limit  ? parseInt(limit)  : undefined,
      search, district,
    }));
  } catch (err) { next(err); }
}

export async function createSchool(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = SchoolMappingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const school = await schoolService.createSchool(parsed.data);
    res.status(201).json(school);
  } catch (err) { next(err); }
}

export async function updateSchool(req: Request, res: Response, next: NextFunction) {
  try {
    const school = await schoolService.updateSchool(req.params.id, req.body);
    res.json(school);
  } catch (err) { next(err); }
}

export async function deleteSchool(req: Request, res: Response, next: NextFunction) {
  try {
    await schoolService.deleteSchool(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function ingestExcel(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ message: 'Excel file is required' }); return; }

    const wb = XLSX.read(file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

    const rows = raw.map(r => ({
      districtName: String(r.districtName ?? '').trim(),
      blockName:    String(r.blockName    ?? '').trim(),
      placeName:    String(r.placeName    ?? '').trim(),
      boardCode:    String(r.boardCode    ?? '').trim(),
      schoolName:   String(r.schoolName   ?? '').trim(),
      udiseCode:    String(r.udiseCode    ?? '').trim(),
    }));

    const validRows: typeof rows = [];
    const invalidRows: { row: number; errors: string[] }[] = [];

    rows.forEach((row, i) => {
      const result = SchoolMappingSchema.safeParse(row);
      if (result.success) validRows.push(result.data);
      else invalidRows.push({ row: i + 2, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) });
    });

    if (validRows.length === 0) {
      res.status(422).json({ message: 'No valid rows found', errors: invalidRows }); return;
    }

    const summary = await schoolService.ingestSchoolMappings(validRows);
    res.json({ ...summary, parseErrors: invalidRows });
  } catch (err) { next(err); }
}
