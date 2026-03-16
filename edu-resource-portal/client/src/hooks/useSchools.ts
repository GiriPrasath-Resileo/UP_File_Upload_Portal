import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as schoolService from '../services/schoolService';
import { useToast } from '../components/common/Toast';
import type { SchoolMappingData } from '@edu-portal/shared';

export const SCHOOLS_KEY   = 'schools';
export const DISTRICTS_KEY = 'districts';
export const BLOCKS_KEY    = 'blocks';

export function useDistricts() {
  return useQuery({
    queryKey: [DISTRICTS_KEY],
    queryFn:  schoolService.getDistricts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlocks(district: string) {
  return useQuery({
    queryKey: [BLOCKS_KEY, district],
    queryFn:  () => schoolService.getBlocks(district),
    enabled:  !!district,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSchoolsForBlock(district: string, block: string) {
  return useQuery({
    queryKey: [SCHOOLS_KEY, 'block', district, block],
    queryFn:  () => schoolService.getSchoolsForBlock(district, block),
    enabled:  !!district && !!block,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllSchools(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: [SCHOOLS_KEY, 'list', params],
    queryFn:  () => schoolService.listAllSchools(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (data: SchoolMappingData) => schoolService.createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHOOLS_KEY] });
      showToast('School created successfully', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SchoolMappingData> }) =>
      schoolService.updateSchool(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHOOLS_KEY] });
      showToast('School updated', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => schoolService.deleteSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHOOLS_KEY] });
      showToast('School deleted', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });
}
