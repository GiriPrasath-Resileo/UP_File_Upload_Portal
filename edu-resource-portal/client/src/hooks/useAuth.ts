import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import * as authService from '../services/authService';
import { useToast } from '../components/common/Toast';
import type { LoginData } from '@edu-portal/shared';

export function useAuth() {
  const { user, setUser, isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (authUser) => {
      setUser(authUser);
      navigate('/dashboard');
      showToast('Logged in successfully', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Invalid credentials', 'error');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      setUser(null);
      queryClient.clear();
      navigate('/login');
    },
  });

  return {
    user,
    isAuthenticated,
    isAdmin,
    login:  loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
  };
}
