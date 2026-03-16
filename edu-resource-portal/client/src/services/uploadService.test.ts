import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as uploadService from './uploadService';
import api from './api';

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe('uploadService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getStats fetches stats', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { total: 10 } });
    const result = await uploadService.getStats();
    expect(api.get).toHaveBeenCalledWith('/uploads/stats');
    expect(result).toEqual({ total: 10 });
  });

  it('listUploads fetches with params', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { uploads: [], total: 0 } });
    await uploadService.listUploads({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/uploads', { params: { page: 1 } });
  });

  it('getPresignedUrl returns url', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { url: 'https://example.com/file.pdf' } });
    const result = await uploadService.getPresignedUrl('id1');
    expect(api.get).toHaveBeenCalledWith('/uploads/id1/url');
    expect(result).toBe('https://example.com/file.pdf');
  });

  it('deleteUpload calls delete', async () => {
    (api.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await uploadService.deleteUpload('id1');
    expect(api.delete).toHaveBeenCalledWith('/uploads/id1');
  });
});
