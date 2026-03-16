import React from 'react';
import { clsx } from 'clsx';

interface Option { value: string; label: string; disabled?: boolean }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
  options:  Option[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, className, ...props },
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
      <div className="relative">
        <select
          ref={ref}
          {...props}
          className={clsx(
            'w-full appearance-none rounded-lg border text-[0.95rem] text-slate-900 transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            'px-3.5 py-2.5 pr-9',
            error
              ? 'border-rose-300 bg-rose-50 focus:ring-rose-400'
              : 'border-slate-300 bg-white hover:border-slate-400',
            className
          )}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-[0.85rem] text-rose-500 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-[0.85rem] text-slate-500">{hint}</p>}
    </div>
  );
});
