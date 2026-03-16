import type { Request, Response, NextFunction } from 'express';
import * as uploadService from '../services/upload.service';
import { parseExcelBuffer, generateBulkTemplate } from '../utils/excelParser';
import { UploadFormSchema } from '@edu-portal/shared';
import type { Express } from 'express';

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await uploadService.getStats();
    res.json(stats);
  } catch (err) { next(err); }
}

export async function listUploads(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, district, status, from, to } = req.query as Record<string, string>;
    const uploadedById = req.user!.role === 'UPLOADER' ? req.user!.id : undefined;
    const result = await uploadService.getUploads({
      page:    page   ? parseInt(page)   : undefined,
      limit:   limit  ? parseInt(limit)  : undefined,
      search, district, status, from, to,
      uploadedById,
    });
    res.json(result);
  } catch (err) { next(err); }
}

export async function getUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const upload = await uploadService.getUploadById(req.params.id);
    res.json(upload);
  } catch (err) { next(err); }
}

export async function createUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ message: 'PDF file is required' }); return; }

    const parsed = UploadFormSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const result = await uploadService.createUpload(
      parsed.data,
      file.buffer,
      file.mimetype,
      req.user!.id
    );
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function bulkUploadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const excelFiles = files?.['excelFile'];
    const pdfFiles   = files?.['pdfFiles'] ?? [];

    if (!excelFiles || excelFiles.length === 0) {
      res.status(400).json({ message: 'Excel file is required' }); return;
    }

    const { valid, errors } = parseExcelBuffer(excelFiles[0].buffer);

    if (valid.length === 0) {
      res.status(422).json({ message: 'No valid rows found', errors }); return;
    }

    // Build PDF map: filename -> buffer
    const pdfMap = new Map<string, Buffer>();
    for (const pdf of pdfFiles) {
      pdfMap.set(pdf.originalname, pdf.buffer);
    }

    const result = await uploadService.bulkUpload(
      valid.map(v => v.row),
      pdfMap,
      req.user!.id
    );

    res.status(201).json({ ...result, parseErrors: errors });
  } catch (err) { next(err); }
}

export async function downloadTemplate(_req: Request, res: Response, next: NextFunction) {
  try {
    const buffer = generateBulkTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="bulk_upload_template.xlsx"');
    res.send(buffer);
  } catch (err) { next(err); }
}

export async function getPresignedUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const url = await uploadService.getPresignedUrl(req.params.id);
    res.json({ url });
  } catch (err) { next(err); }
}

export async function deleteUpload(req: Request, res: Response, next: NextFunction) {
  try {
    await uploadService.deleteUpload(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function updateUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await uploadService.updateUpload(req.params.id, req.body);
    res.json(updated);
  } catch (err) { next(err); }
}
