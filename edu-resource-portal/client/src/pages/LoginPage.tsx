import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-2xl shadow-indigo-500/30 mb-4">
            <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">EduResource Portal</h1>
          <p className="text-slate-400 mt-1 text-[0.95rem]">{import.meta.env.VITE_APP_STATE_LABEL as string} — Educational Resource Management</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl shadow-slate-900/50 p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-[0.95rem] text-slate-500 mb-6">Sign in to your account to continue</p>
          <LoginForm />
        </div>

        <p className="text-center text-[0.85rem] text-slate-500 mt-6">
          © {new Date().getFullYear()} EduResource Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
}
