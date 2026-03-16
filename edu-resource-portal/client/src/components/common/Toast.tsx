import React, { createContext, useContext, useState, useCallback } from 'react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id:      string;
  message: string;
  type:    ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-rose-50    border-rose-200    text-rose-800',
  warning: 'bg-amber-50   border-amber-200   text-amber-800',
  info:    'bg-indigo-50  border-indigo-200  text-indigo-800',
};

const ICON_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-500 text-white',
  error:   'bg-rose-500    text-white',
  warning: 'bg-amber-500   text-white',
  info:    'bg-indigo-500  text-white',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={clsx(
              'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto',
              'animate-slide-up transition-all duration-200',
              STYLES[toast.type]
            )}
          >
            <span className={clsx('flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', ICON_STYLES[toast.type])}>
              {ICONS[toast.type]}
            </span>
            <span className="text-sm font-medium flex-1 leading-relaxed">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
