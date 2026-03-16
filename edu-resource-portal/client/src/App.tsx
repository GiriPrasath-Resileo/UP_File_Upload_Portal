import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastProvider } from './components/common/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SchoolMasterPage } from './pages/SchoolMasterPage';
import { ManageUsersPage } from './pages/ManageUsersPage';
import { AboutPage } from './pages/AboutPage';
import CoverageDashboardPage from './pages/CoverageDashboardPage';
import ArchitectureFlowPage from './pages/ArchitectureFlowPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/schools"   element={<SchoolMasterPage />} />
              <Route path="/users"     element={<ManageUsersPage />} />
              <Route path="/about"     element={<AboutPage />} />
              <Route path="/coverage"  element={<CoverageDashboardPage />} />
              <Route path="/architecture" element={<ArchitectureFlowPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </QueryClientProvider>
  );
}
