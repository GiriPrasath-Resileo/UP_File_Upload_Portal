import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as uploadService from '../services/uploadService';
import { updateUpload } from '../services/uploadService';
import { useToast } from '../components/common/Toast';
import type { UploadFormData } from '@edu-portal/shared';

export const UPLOADS_KEY = 'uploads';
export const STATS_KEY   = 'upload-stats';

export function useUploadStats() {
  return useQuery({
    queryKey: [STATS_KEY],
    queryFn:  uploadService.getStats,
    refetchInterval: 30_000,
  });
}

export function useUploads(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: [UPLOADS_KEY, params],
    queryFn:  () => uploadService.listUploads(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateUpload() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ formData, file }: { formData: UploadFormData; file: File }) =>
      uploadService.createUpload(formData, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [UPLOADS_KEY] });
      queryClient.invalidateQueries({ queryKey: [STATS_KEY] });
      showToast(`Upload successful! File No: ${data.fileNumber}`, 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Upload failed', 'error');
    },
  });
}

export function useBulkUpload() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ excelFile, pdfFiles }: { excelFile: File; pdfFiles: File[] }) =>
      uploadService.bulkUpload(excelFile, pdfFiles),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [UPLOADS_KEY] });
      queryClient.invalidateQueries({ queryKey: [STATS_KEY] });
      showToast(
        `Bulk upload complete: ${data.success} succeeded, ${data.failed.length} failed`,
        data.failed.length === 0 ? 'success' : 'warning'
      );
    },
    onError: (err: Error) => {
      showToast(err.message || 'Bulk upload failed', 'error');
    },
  });
}

export function useDeleteUpload() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => uploadService.deleteUpload(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UPLOADS_KEY] });
      queryClient.invalidateQueries({ queryKey: [STATS_KEY] });
      showToast('Upload deleted', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });
}

export function useUpdateUpload() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateUpload>[1] }) =>
      updateUpload(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UPLOADS_KEY] });
      showToast('Upload updated successfully', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });
}
