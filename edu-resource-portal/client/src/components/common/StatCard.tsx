import React from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
  title:   string;
  value:   string | number;
  icon:    React.ReactNode;
  color:   'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  subtitle?: string;
  loading?:  boolean;
}

const BG: Record<string, string> = {
  indigo:  'bg-indigo-50  text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber:   'bg-amber-50   text-amber-600',
  rose:    'bg-rose-50    text-rose-600',
  sky:     'bg-sky-50     text-sky-600',
};

export function StatCard({ title, value, icon, color, subtitle, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-slate-300 flex items-start gap-4 transition-shadow duration-200">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 [&>svg]:w-6 [&>svg]:h-6', BG[color])}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[0.9rem] font-semibold text-slate-600 tracking-wide uppercase mb-0.5">{title}</p>
        {loading ? (
          <div className="h-8 w-28 bg-slate-100 rounded animate-pulse" />
        ) : (
          <p className="text-[1.75rem] sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">{value}</p>
        )}
        {subtitle && <p className="text-[0.85rem] text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
