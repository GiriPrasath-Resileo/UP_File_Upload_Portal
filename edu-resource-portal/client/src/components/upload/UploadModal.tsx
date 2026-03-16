import React from 'react';
import { Modal } from '../common/Modal';
import { UploadForm } from './UploadForm';

interface UploadModalProps {
  open:    boolean;
  onClose: () => void;
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="New Upload" size="2xl">
      <UploadForm onSuccess={onClose} />
    </Modal>
  );
}
