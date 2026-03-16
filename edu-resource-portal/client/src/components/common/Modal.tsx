import React, { useEffect } from 'react';
import { clsx } from 'clsx';

interface ModalProps {
  open:      boolean;
  onClose:   () => void;
  title?:    string;
  size?:     'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  children:  React.ReactNode;
  hideClose?: boolean;
}

const SIZES: Record<string, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
  full: 'max-w-5xl',
};

export function Modal({ open, onClose, title, size = 'lg', children, hideClose }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        data-testid="modal-backdrop"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={clsx(
          'relative bg-white rounded-2xl shadow-2xl w-full animate-slide-up',
          'flex flex-col max-h-[90vh]',
          SIZES[size]
        )}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {!hideClose && (
              <button
                onClick={onClose}
                className="ml-auto -mr-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
