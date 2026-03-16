import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginData } from '@edu-portal/shared';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
  });

  return (
    <form onSubmit={handleSubmit(login)} className="flex flex-col gap-5">
      <Input
        {...register('userId')}
        label="User ID"
        placeholder="Enter your user ID"
        autoComplete="username"
        required
        error={errors.userId?.message}
        leftAdornment={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />
      <Input
        {...register('password')}
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        leftAdornment={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      />
      <Button type="submit" loading={isLoggingIn} size="lg" className="w-full mt-1">
        Sign In
      </Button>
    </form>
  );
}
