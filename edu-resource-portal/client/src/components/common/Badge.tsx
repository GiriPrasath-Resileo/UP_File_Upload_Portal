import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'indigo';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?:     boolean;
  className?: string;
}

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-slate-100  text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100   text-amber-700',
  danger:  'bg-rose-100    text-rose-700',
  info:    'bg-sky-100     text-sky-700',
  indigo:  'bg-indigo-100  text-indigo-700',
};

const DOT_VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-rose-500',
  info:    'bg-sky-500',
  indigo:  'bg-indigo-500',
};

export function Badge({ children, variant = 'default', dot = false, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      VARIANTS[variant], className
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_VARIANTS[variant])} />}
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    COMPLETED:  'success',
    PENDING:    'warning',
    PROCESSING: 'info',
    FAILED:     'danger',
  };
  return <Badge variant={map[status] ?? 'default'} dot>{status}</Badge>;
}
