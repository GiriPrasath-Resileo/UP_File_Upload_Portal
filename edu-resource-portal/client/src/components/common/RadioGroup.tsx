import React from 'react';
import { clsx } from 'clsx';

interface Option { value: string; label: string }

interface RadioGroupProps {
  label?:   string;
  error?:   string;
  options:  Option[];
  value:    string;
  onChange: (value: string) => void;
  name:     string;
  inline?:  boolean;
}

export function RadioGroup({ label, error, options, value, onChange, name, inline = false }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className={clsx('flex gap-3 flex-wrap', !inline && 'flex-col sm:flex-row')}>
        {options.map(opt => (
          <label
            key={opt.value}
            className={clsx(
              'flex items-center gap-2 cursor-pointer px-3.5 py-2 rounded-lg border text-sm font-medium transition-all duration-150',
              value === opt.value
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span className={clsx(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              value === opt.value ? 'border-indigo-500' : 'border-slate-300'
            )}>
              {value === opt.value && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
            </span>
            {opt.label}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
