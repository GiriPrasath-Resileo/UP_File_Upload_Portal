import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as schoolService from './schoolService';
import api from './api';

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe('schoolService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getDistricts fetches districts', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: ['LKO', 'AYD'] });
    const result = await schoolService.getDistricts();
    expect(api.get).toHaveBeenCalledWith('/schools/districts');
    expect(result).toEqual(['LKO', 'AYD']);
  });

  it('getBlocks fetches blocks for district', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: ['Block1'] });
    const result = await schoolService.getBlocks('LKO');
    expect(api.get).toHaveBeenCalledWith('/schools/districts/LKO/blocks');
    expect(result).toEqual(['Block1']);
  });

  it('listAllSchools fetches with params', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { schools: [], total: 0 } });
    await schoolService.listAllSchools({ page: 1, limit: 10 });
    expect(api.get).toHaveBeenCalledWith('/schools', { params: { page: 1, limit: 10 } });
  });

  it('deleteSchool calls delete', async () => {
    (api.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await schoolService.deleteSchool('id1');
    expect(api.delete).toHaveBeenCalledWith('/schools/id1');
  });
});
