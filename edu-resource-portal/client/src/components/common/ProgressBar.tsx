import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value:    number; // 0–100
  label?:   string;
  color?:   'indigo' | 'emerald' | 'amber' | 'rose';
  size?:    'sm' | 'md';
  showPct?: boolean;
}

const COLORS: Record<string, string> = {
  indigo:  'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
};

export function ProgressBar({ value, label, color = 'indigo', size = 'md', showPct = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex flex-col gap-1">
      {(label || showPct) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-slate-500">{label}</span>}
          {showPct && <span className="text-xs font-medium text-slate-700">{pct}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-slate-100 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className={clsx('h-full rounded-full transition-all duration-300', COLORS[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
