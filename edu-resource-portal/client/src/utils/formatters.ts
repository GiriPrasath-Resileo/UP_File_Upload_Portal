import { format, formatDistanceToNow } from 'date-fns';

export const fmtDate = (d: string | Date) =>
  format(new Date(d), 'dd MMM yyyy');

export const fmtDateTime = (d: string | Date) =>
  format(new Date(d), 'dd MMM yyyy, HH:mm');

export const fmtRelative = (d: string | Date) =>
  formatDistanceToNow(new Date(d), { addSuffix: true });

export const fmtEnum = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export const fmtBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export function buildCsvRows<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const header = columns.map(c => c.header).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key];
      const str = val == null ? '' : String(val);
      return str.includes(',') ? `"${str}"` : str;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
