import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with value', () => {
    const { container } = render(<ProgressBar value={50} />);
    const fill = container.querySelector('[style*="width"]');
    expect(fill).toHaveStyle({ width: '50%' });
  });

  it('clamps value to 0-100', () => {
    const { container: c1 } = render(<ProgressBar value={150} />);
    expect(c1.querySelector('[style*="width"]')).toHaveStyle({ width: '100%' });

    const { container: c2 } = render(<ProgressBar value={-10} />);
    expect(c2.querySelector('[style*="width"]')).toHaveStyle({ width: '0%' });
  });

  it('renders label when provided', () => {
    render(<ProgressBar value={30} label="Progress" />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('shows percentage when showPct is true', () => {
    render(<ProgressBar value={75} showPct />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies color variant', () => {
    const { container } = render(<ProgressBar value={50} color="emerald" />);
    expect(container.querySelector('.bg-emerald-500')).toBeInTheDocument();
  });
});
