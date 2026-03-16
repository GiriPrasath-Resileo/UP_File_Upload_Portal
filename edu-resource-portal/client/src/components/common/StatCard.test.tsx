import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

const MockIcon = () => <span data-testid="icon">📊</span>;

describe('StatCard', () => {
  it('renders title and value', () => {
    render(
      <StatCard title="Total Uploads" value="42" icon={<MockIcon />} color="indigo" />
    );
    expect(screen.getByText('Total Uploads')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <StatCard
        title="Uploads"
        value="10"
        icon={<MockIcon />}
        color="emerald"
        subtitle="This month"
      />
    );
    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    const { container } = render(
      <StatCard
        title="Uploads"
        value="0"
        icon={<MockIcon />}
        color="indigo"
        loading
      />
    );
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('applies color variant', () => {
    const { container } = render(
      <StatCard title="Test" value="1" icon={<MockIcon />} color="rose" />
    );
    expect(container.querySelector('.bg-rose-50')).toBeInTheDocument();
  });
});
