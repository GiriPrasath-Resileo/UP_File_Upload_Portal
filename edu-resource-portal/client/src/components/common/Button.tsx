import React from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm',
  secondary: 'bg-slate-100  hover:bg-slate-200  active:bg-slate-300  text-slate-700',
  danger:    'bg-rose-600   hover:bg-rose-700   active:bg-rose-800   text-white shadow-sm',
  ghost:     'bg-transparent hover:bg-slate-100 active:bg-slate-200  text-slate-700',
  outline:   'bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 shadow-sm',
};

const SIZES: Record<Size, string> = {
  xs: 'text-[0.85rem] px-2.5 py-1.5 gap-1',
  sm: 'text-[0.95rem] px-3   py-2   gap-1.5',
  md: 'text-[0.95rem] px-4   py-2.5 gap-2',
  lg: 'text-base px-5  py-3   gap-2',
};

export function Button({
  variant = 'primary',
  size    = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
