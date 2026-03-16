import api from './api';
import type { UploadListResponse, UploadStats, Upload, BulkUploadResult } from '../types/upload.types';
import type { UploadFormData } from '@edu-portal/shared';

export async function getStats(): Promise<UploadStats> {
  const res = await api.get<UploadStats>('/uploads/stats');
  return res.data;
}

export async function listUploads(params: Record<string, string | number | undefined>): Promise<UploadListResponse> {
  const res = await api.get<UploadListResponse>('/uploads', { params });
  return res.data;
}

export async function getUpload(id: string): Promise<Upload> {
  const res = await api.get<Upload>(`/uploads/${id}`);
  return res.data;
}

export async function createUpload(formData: UploadFormData, file: File): Promise<{ id: string; fileNumber: string }> {
  const fd = new FormData();
  Object.entries(formData).forEach(([k, v]) => fd.append(k, v as string));
  fd.append('file', file);
  const res = await api.post<{ id: string; fileNumber: string }>('/uploads', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function bulkUpload(excelFile: File, pdfFiles: File[]): Promise<BulkUploadResult> {
  const fd = new FormData();
  fd.append('excelFile', excelFile);
  pdfFiles.forEach(f => fd.append('pdfFiles', f));
  const res = await api.post<BulkUploadResult>('/uploads/bulk', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function downloadTemplate(): Promise<void> {
  const res = await api.get('/uploads/bulk-template', { responseType: 'blob' });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bulk_upload_template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

const PRESIGNED_URL_TIMEOUT_MS = 10_000;

export async function getPresignedUrl(id: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PRESIGNED_URL_TIMEOUT_MS);
  try {
    const res = await api.get<{ url: string }>(`/uploads/${id}/url`, { signal: controller.signal });
    return res.data.url;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function deleteUpload(id: string): Promise<void> {
  await api.delete(`/uploads/${id}`);
}

export async function updateUpload(id: string, data: {
  medium?: string;
  classGrade?: string;
  subject?: string;
  sampleType?: string;
  gender?: string;
  dominantHand?: string;
}): Promise<Upload> {
  const res = await api.put<Upload>(`/uploads/${id}`, data);
  return res.data;
}
