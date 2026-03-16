import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from './RadioGroup';

const options = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

describe('RadioGroup', () => {
  it('renders options', () => {
    render(<RadioGroup options={options} value="yes" onChange={() => {}} name="test" />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onChange when option is clicked', async () => {
    const onChange = vi.fn();
    render(<RadioGroup options={options} value="yes" onChange={onChange} name="test" />);
    await userEvent.click(screen.getByText('No'));
    expect(onChange).toHaveBeenCalledWith('no');
  });

  it('shows error', () => {
    render(<RadioGroup options={options} value="" onChange={() => {}} name="test" error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<RadioGroup label="Choose" options={options} value="" onChange={() => {}} name="test" />);
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });
});
