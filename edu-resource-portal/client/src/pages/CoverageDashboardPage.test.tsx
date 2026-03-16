import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoverageDashboardPage from './CoverageDashboardPage';

const validReport = {
  generatedAt: '2026-03-16T18:00:00Z',
  frontend: {
    total: { statements: { pct: 80 }, branches: { pct: 70 }, functions: { pct: 60 }, lines: { pct: 80 } },
    files: [{ file: 'src/App.tsx', lines: { pct: 50 } }],
  },
  backend: {
    total: { statements: { pct: 90 }, branches: { pct: 85 }, functions: { pct: 88 }, lines: { pct: 90 } },
    files: [{ file: 'src/utils/foo.ts', lines: { pct: 100 } }],
  },
};

describe('CoverageDashboardPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('shows loading state initially', () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));
    render(<CoverageDashboardPage />);
    expect(screen.getByText(/loading coverage data/i)).toBeInTheDocument();
  });

  it('shows report when fetch succeeds with valid JSON', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve(validReport),
    });
    render(<CoverageDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Coverage Dashboard')).toBeInTheDocument();
    });
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('shows error when fetch returns 404', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    render(<CoverageDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load report/i)).toBeInTheDocument();
    });
  });

  it('shows error when JSON is malformed', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.reject(new Error('parse error')),
    });
    render(<CoverageDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load report/i)).toBeInTheDocument();
    });
  });

  it('shows error when Content-Type is not JSON', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: { get: () => 'text/plain' },
    });
    render(<CoverageDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load report/i)).toBeInTheDocument();
    });
  });

  it('refresh button triggers refetch', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve(validReport),
    });
    render(<CoverageDashboardPage />);
    await waitFor(() => expect(screen.getByText('Frontend')).toBeInTheDocument());
    (fetch as ReturnType<typeof vi.fn>).mockClear();
    await userEvent.click(screen.getByRole('button', { name: /refresh/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it('rejects invalid report shape', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ invalid: 'shape' }),
    });
    render(<CoverageDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load report/i)).toBeInTheDocument();
    });
  });
});
