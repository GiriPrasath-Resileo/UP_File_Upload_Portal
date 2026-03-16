import { randomUUID } from 'crypto';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { buildS3KeyWithId } from '../utils/s3PathBuilder';
import { issueFileNumber } from './fileNumber.service';
import type { UploadFormData, BulkUploadRow } from '@edu-portal/shared';
import { logger } from '../utils/logger';
import type { UploadStatus } from '@prisma/client';

export interface UploadResult {
  id: string;
  fileNumber: string;
  s3Key: string;
  status: string;
}

export async function createUpload(
  formData: UploadFormData,
  fileBuffer: Buffer,
  mimeType: string,
  uploadedById: string
): Promise<UploadResult> {
  if (mimeType !== 'application/pdf') throw new Error('Only PDF files are allowed');

  const fileId = randomUUID();
  const s3Key = buildS3KeyWithId({
    state:       env.APP_STATE,
    district:    formData.district,
    block:       formData.block,
    place:       formData.place,
    board:       formData.board,
    school:      formData.schoolName,
    medium:      formData.medium,
    classGrade:  formData.classGrade,
    subject:     formData.subject,
    sampleType:  formData.sampleType,
    gender:      formData.gender,
    hand:        formData.dominantHand,
    fileId,
  });

  // Upload to S3 first. File number is only issued on success — no DB record or sequence increment on failure.
  if (!env.S3_MOCK) {
    try {
      await s3Client.send(new PutObjectCommand({
        Bucket:      env.S3_BUCKET_NAME,
        Key:         s3Key,
        Body:        fileBuffer,
        ContentType: 'application/pdf',
        Metadata: {
          district:   formData.district,
          udiseCode:  formData.udiseCode,
          uploadedBy: uploadedById,
        },
      }));
    } catch (err) {
      throw err;
    }
  } else {
    logger.warn(`[S3_MOCK] Skipped S3 upload for ${fileId}. Set S3_MOCK=false with real credentials to enable.`);
  }

  // Only on successful S3 upload: issue file number and create DB record (no gaps in sequence on failure).
  try {
    return await prisma.$transaction(async tx => {
      const fileNumber = await issueFileNumber(tx);
      const upload = await tx.upload.create({
        data: {
          fileNumber,
          s3Key,
          s3Bucket:    env.S3_BUCKET_NAME,
          district:    formData.district,
          block:       formData.block,
          place:       formData.place,
          board:       formData.board,
          schoolName:  formData.schoolName,
          udiseCode:   formData.udiseCode,
          medium:      formData.medium as any,
          classGrade:  formData.classGrade,
          subject:     formData.subject as any,
          sampleType:  formData.sampleType as any,
        gender:      formData.gender as any,
        dominantHand: formData.dominantHand as any,
          status:      'COMPLETED',
          uploadedById,
        },
      });
      logger.info(`Upload completed: ${fileNumber} -> ${s3Key}`);
      return { id: upload.id, fileNumber, s3Key, status: 'COMPLETED' };
    });
  } catch (err) {
    if (!env.S3_MOCK) {
      try {
        await s3Client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: s3Key }));
        logger.warn(`Cleaned up orphaned S3 object ${s3Key} after DB transaction failed`);
      } catch (cleanupErr) {
        logger.error(`Failed to clean up orphaned S3 object ${s3Key}:`, cleanupErr);
      }
    }
    throw err;
  }
}

const BULK_UPLOAD_CONCURRENCY = 5;

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<{ results: (R | undefined)[]; errors: { item: T; error: string }[] }> {
  const results: (R | undefined)[] = new Array(items.length);
  const errors: { item: T; error: string }[] = [];
  const limit = Math.min(concurrency, items.length);

  const workers = Array.from({ length: limit }, (_, workerId) =>
    (async () => {
      for (let i = workerId; i < items.length; i += limit) {
        const item = items[i];
        try {
          const r = await fn(item);
          results[i] = r;
        } catch (err) {
          errors.push({ item, error: (err as Error).message });
        }
      }
    })()
  );

  await Promise.all(workers);
  return { results, errors };
}

export async function bulkUpload(
  rows: BulkUploadRow[],
  pdfMap: Map<string, Buffer>,
  uploadedById: string
): Promise<{ success: number; failed: { pdfFileName: string; error: string }[] }> {
  const { validRows, missing } = rows.reduce<{ validRows: BulkUploadRow[]; missing: BulkUploadRow[] }>(
    (acc, row) => {
      if (pdfMap.has(row.pdfFileName)) acc.validRows.push(row);
      else acc.missing.push(row);
      return acc;
    },
    { validRows: [], missing: [] }
  );

  const failed: { pdfFileName: string; error: string }[] = missing.map(row => ({
    pdfFileName: row.pdfFileName,
    error: `PDF file not found: ${row.pdfFileName}`,
  }));

  const { results, errors } = await runWithConcurrency(validRows, BULK_UPLOAD_CONCURRENCY, async row => {
    const pdfBuffer = pdfMap.get(row.pdfFileName)!;
    return createUpload(
      {
        district:     row.district,
        block:        row.block,
        place:        row.place,
        board:        row.board,
        schoolName:   row.schoolName,
        udiseCode:    row.udiseCode,
        medium:       row.medium,
        classGrade:   row.classGrade,
        subject:      row.subject,
        sampleType:   row.sampleType,
        gender:       row.gender,
        dominantHand: row.dominantHand,
      },
      pdfBuffer,
      'application/pdf',
      uploadedById
    );
  });

  failed.push(...errors.map(e => ({ pdfFileName: (e.item as BulkUploadRow).pdfFileName, error: e.error })));
  const success = results.filter((r): r is UploadResult => r !== undefined).length;

  return { success, failed };
}

export async function getUploads(params: {
  page?: number;
  limit?: number;
  search?: string;
  district?: string;
  status?: string;
  from?: string;
  to?: string;
  uploadedById?: string;
}) {
  const { page = 1, limit = 20, search, district, status, from, to, uploadedById } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { fileNumber:  { contains: search, mode: 'insensitive' } },
      { district:    { contains: search, mode: 'insensitive' } },
      { schoolName:  { contains: search, mode: 'insensitive' } },
      { udiseCode:   { contains: search, mode: 'insensitive' } },
    ];
  }
  if (district)     where.district     = { contains: district, mode: 'insensitive' };
  if (status)       where.status       = status as UploadStatus;
  if (uploadedById) where.uploadedById = uploadedById;
  if (from || to) {
    where.createdAt = {
      ...(from && { gte: new Date(from) }),
      ...(to   && { lte: new Date(to) }),
    };
  }

  const [total, uploads] = await Promise.all([
    prisma.upload.count({ where }),
    prisma.upload.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { userId: true } } },
    }),
  ]);

  return {
    data: uploads,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getUploadById(id: string) {
  return prisma.upload.findUniqueOrThrow({
    where: { id },
    include: { uploadedBy: { select: { userId: true } } },
  });
}

export async function getPresignedUrl(id: string): Promise<string> {
  const upload = await prisma.upload.findUniqueOrThrow({ where: { id } });
  if (env.S3_MOCK) {
    logger.warn(`[S3_MOCK] Returning mock presigned URL for upload ${upload.fileNumber}`);
    return `https://mock-s3.example.com/${upload.s3Key}?mock=true`;
  }
  const command = new GetObjectCommand({ Bucket: upload.s3Bucket, Key: upload.s3Key });
  return getSignedUrl(s3Client, command, { expiresIn: env.S3_PRESIGNED_URL_EXPIRY });
}

export async function deleteUpload(id: string): Promise<void> {
  const upload = await prisma.upload.findUniqueOrThrow({ where: { id } });
  await s3Client.send(new DeleteObjectCommand({ Bucket: upload.s3Bucket, Key: upload.s3Key }));
  await prisma.upload.delete({ where: { id } });
  logger.info(`Deleted upload ${upload.fileNumber}`);
}

export async function updateUpload(id: string, data: {
  medium?: string;
  classGrade?: string;
  subject?: string;
  sampleType?: string;
  gender?: string;
  dominantHand?: string;
}) {
  return prisma.upload.update({
    where: { id },
    data: {
      ...(data.medium       && { medium:       data.medium       as any }),
      ...(data.classGrade   && { classGrade:   data.classGrade }),
      ...(data.subject      && { subject:      data.subject      as any }),
      ...(data.sampleType   && { sampleType:   data.sampleType   as any }),
      ...(data.gender       && { gender:       data.gender       as any }),
      ...(data.dominantHand && { dominantHand: data.dominantHand as any }),
    },
  });
}

export async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [total, todayCount, schoolCount, nextSeq] = await Promise.all([
    prisma.upload.count(),
    prisma.upload.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.upload.groupBy({ by: ['udiseCode'] }).then(r => r.length),
    prisma.fileSequence.findUnique({ where: { id: 1 } }),
  ]);

  return {
    total,
    today: todayCount,
    schools: schoolCount,
    nextFileNumber: `UP-${(nextSeq?.lastVal ?? 100000) + 1}`,
  };
}
