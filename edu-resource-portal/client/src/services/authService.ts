import api from './api';
import type { LoginData } from '@edu-portal/shared';

export interface AuthUser {
  id:            string;
  userId:        string;
  role:          string;
  districtScope: string | null;
}

export async function login(data: LoginData): Promise<AuthUser> {
  const res = await api.post<{ user: AuthUser }>('/auth/login', data);
  return res.data.user;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMe(): Promise<AuthUser> {
  const res = await api.get<{ user: AuthUser }>('/auth/me');
  return res.data.user;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('/admin/change-password', { currentPassword, newPassword });
}
