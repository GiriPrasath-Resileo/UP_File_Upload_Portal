import api from './api';
import type { SchoolListResponse, School } from '../types/school.types';
import type { SchoolMappingData } from '@edu-portal/shared';

export async function getDistricts(): Promise<string[]> {
  const res = await api.get<string[]>('/schools/districts');
  return res.data;
}

export async function getBlocks(district: string): Promise<string[]> {
  const res = await api.get<string[]>(`/schools/districts/${encodeURIComponent(district)}/blocks`);
  return res.data;
}

export async function getSchoolsForBlock(district: string, block: string): Promise<{ id: string; name: string; udiseCode: string; boardCode: string; placeName: string }[]> {
  const res = await api.get(`/schools/districts/${encodeURIComponent(district)}/blocks/${encodeURIComponent(block)}/schools`);
  return res.data;
}

export async function listAllSchools(params: Record<string, string | number | undefined>): Promise<SchoolListResponse> {
  const res = await api.get<SchoolListResponse>('/schools', { params });
  return res.data;
}

export async function createSchool(data: SchoolMappingData): Promise<School> {
  const res = await api.post<School>('/schools', data);
  return res.data;
}

export async function updateSchool(id: string, data: Partial<SchoolMappingData>): Promise<School> {
  const res = await api.put<School>(`/schools/${id}`, data);
  return res.data;
}

export async function deleteSchool(id: string): Promise<void> {
  await api.delete(`/schools/${id}`);
}

export async function ingestSchoolsExcel(file: File): Promise<{ created: number; skipped: number }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api.post<{ created: number; skipped: number }>('/schools/ingest', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
