import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
        'src/App.tsx',
        'src/types/**',
        'src/pages/AboutPage.tsx',
        'src/pages/DashboardPage.tsx',
        'src/pages/LoginPage.tsx',
        'src/pages/ManageUsersPage.tsx',
        'src/pages/SchoolMasterPage.tsx',
        'src/components/layout/**',
        'src/components/upload/**',
        'src/components/auth/**',
        'src/components/common/DataTable.tsx',
        'src/hooks/**',
        'src/services/api.ts',
        'src/components/common/Toast.tsx',
      ],
    },
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@edu-portal/shared': path.resolve(__dirname, '../shared/src/schemas/index.ts'),
    },
  },
});
