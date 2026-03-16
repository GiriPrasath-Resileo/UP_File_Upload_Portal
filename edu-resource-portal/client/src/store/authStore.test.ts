import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
  });

  it('starts with null user', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setUser updates user', () => {
    const user = { id: '1', userId: 'admin', role: 'ADMIN', districtScope: null };
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('isAuthenticated returns false when user is null', () => {
    useAuthStore.setState({ user: null });
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it('isAuthenticated returns true when user exists', () => {
    useAuthStore.setState({ user: { id: '1', userId: 'u', role: 'UPLOADER', districtScope: null } });
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it('isAdmin returns true for ADMIN role', () => {
    useAuthStore.setState({ user: { id: '1', userId: 'a', role: 'ADMIN', districtScope: null } });
    expect(useAuthStore.getState().isAdmin()).toBe(true);
  });

  it('isAdmin returns false for UPLOADER role', () => {
    useAuthStore.setState({ user: { id: '1', userId: 'u', role: 'UPLOADER', districtScope: null } });
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });
});
