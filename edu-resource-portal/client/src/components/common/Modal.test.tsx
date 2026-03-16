import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('returns null when open is false', () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}}>
        <p>Content</p>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders content when open', () => {
    render(
      <Modal open onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    const backdrop = screen.getByTestId('modal-backdrop');
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    );
    const closeBtn = screen.getByRole('button');
    await userEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('hides close button when hideClose is true', () => {
    render(
      <Modal open onClose={() => {}} hideClose>
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
