import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

describe('Select', () => {
  it('renders options', () => {
    render(<Select options={options} value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select label="Choose" options={options} value="" onChange={() => {}} />);
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });

  it('shows placeholder when provided', () => {
    render(<Select options={options} placeholder="Select..." value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Select...' })).toBeInTheDocument();
  });

  it('calls onChange when selection changes', async () => {
    const onChange = vi.fn();
    render(<Select options={options} value="" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message', () => {
    render(<Select options={options} value="" onChange={() => {}} error="Invalid" />);
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });
});
