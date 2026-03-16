import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  id:            string;
  userId:        string;
  role:          string;
  districtScope: string | null;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      isAuthenticated: () => get().user !== null,
      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'edu-portal-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
