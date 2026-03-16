import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from './authService';
import api from './api';

vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login calls api and returns user', async () => {
    const user = { id: '1', userId: 'admin', role: 'ADMIN', districtScope: null };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { user } });
    const result = await authService.login({ userId: 'admin', password: 'x' });
    expect(api.post).toHaveBeenCalledWith('/auth/login', { userId: 'admin', password: 'x' });
    expect(result).toEqual(user);
  });

  it('logout calls api', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await authService.logout();
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('getMe calls api and returns user', async () => {
    const user = { id: '1', userId: 'u', role: 'UPLOADER', districtScope: 'LKO' };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { user } });
    const result = await authService.getMe();
    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(user);
  });

  it('changePassword calls api with correct payload', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await authService.changePassword('old', 'new');
    expect(api.post).toHaveBeenCalledWith('/admin/change-password', {
      currentPassword: 'old',
      newPassword: 'new',
    });
  });
});
