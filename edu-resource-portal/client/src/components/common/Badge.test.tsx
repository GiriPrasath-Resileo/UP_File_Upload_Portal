import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, statusBadge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with dot when dot prop is true', () => {
    render(<Badge dot>Status</Badge>);
    const badge = screen.getByText('Status').closest('span');
    expect(badge?.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success').closest('span')).toHaveClass('bg-emerald-100');
  });
});

describe('statusBadge', () => {
  it('returns Badge for COMPLETED', () => {
    const { container } = render(statusBadge('COMPLETED'));
    expect(container.querySelector('.bg-emerald-100')).toBeInTheDocument();
  });

  it('returns Badge for PENDING', () => {
    const { container } = render(statusBadge('PENDING'));
    expect(container.querySelector('.bg-amber-100')).toBeInTheDocument();
  });

  it('returns default Badge for unknown status', () => {
    const { container } = render(statusBadge('UNKNOWN'));
    expect(container.querySelector('.bg-slate-100')).toBeInTheDocument();
  });
});
