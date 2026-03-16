import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
  leftAdornment?:  React.ReactNode;
  rightAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftAdornment, rightAdornment, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[0.95rem] font-medium text-slate-700">
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAdornment && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">{leftAdornment}</div>
        )}
        <input
          ref={ref}
          {...props}
          className={clsx(
            'w-full rounded-lg border text-[0.95rem] text-slate-900 placeholder-slate-400 transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            leftAdornment  ? 'pl-10'  : 'pl-3.5',
            rightAdornment ? 'pr-10'  : 'pr-3.5',
            'py-2.5',
            error
              ? 'border-rose-300 bg-rose-50 focus:ring-rose-400'
              : 'border-slate-300 bg-white hover:border-slate-400',
            className
          )}
        />
        {rightAdornment && (
          <div className="absolute right-3 text-slate-400">{rightAdornment}</div>
        )}
      </div>
      {error && <p className="text-[0.85rem] text-rose-500 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-[0.85rem] text-slate-500">{hint}</p>}
    </div>
  );
});
