import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { Button } from './Button';
import { Input } from './Input';
import { buildCsvRows, downloadCsv } from '../../utils/formatters';

export interface Column<T> {
  key:       keyof T | string;
  header:    string;
  render?:   (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  csvValue?: (row: T) => string;
  width?:    string;
}

interface DataTableProps<T> {
  data:          T[];
  columns:       Column<T>[];
  keyField:      keyof T;
  loading?:      boolean;
  totalRows?:    number;
  page?:         number;
  pageSize?:     number;
  onPageChange?: (p: number) => void;
  onSearch?:     (s: string) => void;
  searchPlaceholder?: string;
  selectable?:   boolean;
  onBulkDelete?: (ids: string[]) => void;
  exportFilename?: string;
  emptyMessage?: string;
  actions?:      (row: T) => React.ReactNode;
  filters?:      React.ReactNode;
  onEdit?:       (row: T) => void;
}

type SortDir = 'asc' | 'desc' | null;

function getValue<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

export function DataTable<T extends Record<string, unknown>>({
  data, columns, keyField, loading, totalRows, page = 1, pageSize = 20,
  onPageChange, onSearch, searchPlaceholder = 'Search…',
  selectable, onBulkDelete, exportFilename = 'export',
  emptyMessage = 'No records found', actions, filters, onEdit,
}: DataTableProps<T>) {
  const [search,       setSearch]      = useState('');
  const [sortKey,      setSortKey]     = useState<string | null>(null);
  const [sortDir,      setSortDir]     = useState<SortDir>(null);
  const [colFilters,   setColFilters]  = useState<Record<string, string>>({});
  const [filterAnchor, setFilterAnchor] = useState<{ key: string; top: number; left: number } | null>(null);
  const [selected,     setSelected]    = useState<Set<string>>(new Set());

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    onSearch?.(v);
  }, [onSearch]);

  const handleSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return; }
    if (sortDir === 'asc')  { setSortDir('desc'); return; }
    if (sortDir === 'desc') { setSortKey(null); setSortDir(null); return; }
  };

  const processed = useMemo(() => {
    let rows = [...data];

    // Client-side filter by column filters
    Object.entries(colFilters).forEach(([k, v]) => {
      if (!v) return;
      rows = rows.filter(r => {
        const cell = getValue(r, k);
        return String(cell ?? '').toLowerCase().includes(v.toLowerCase());
      });
    });

    // Client-side sort (only if no server pagination)
    if (!onPageChange && sortKey) {
      rows = rows.slice().sort((a, b) => {
        const av = String(getValue(a, sortKey) ?? '');
        const bv = String(getValue(b, sortKey) ?? '');
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return rows;
  }, [data, colFilters, sortKey, sortDir, onPageChange]);

  const totalPages = onPageChange
    ? Math.ceil((totalRows ?? 0) / pageSize)
    : 1;

  const allIds = processed.map(r => String(getValue(r, String(keyField))));
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));

  function toggleAll() {
    if (allSelected) {
      setSelected(prev => { const s = new Set(prev); allIds.forEach(id => s.delete(id)); return s; });
    } else {
      setSelected(prev => { const s = new Set(prev); allIds.forEach(id => s.add(id)); return s; });
    }
  }

  function toggleRow(id: string) {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function handleExport() {
    const rows = processed.map(r => {
      const obj: Record<string, unknown> = {};
      columns.forEach(c => {
        obj[c.header] = c.csvValue ? c.csvValue(r) : String(getValue(r, String(c.key)) ?? '');
      });
      return obj as Record<string, unknown>;
    });
    const csv = buildCsvRows(rows, columns.map(c => ({ key: c.header as any, header: c.header })));
    downloadCsv(csv, `${exportFilename}_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  const SortIcon = ({ col }: { col: string }) => (
    <span className="ml-1 inline-flex flex-col gap-0 leading-none">
      <span className={clsx('text-[8px]', sortKey === col && sortDir === 'asc' ? 'text-indigo-600' : 'text-slate-300')}>▲</span>
      <span className={clsx('text-[8px]', sortKey === col && sortDir === 'desc' ? 'text-indigo-600' : 'text-slate-300')}>▼</span>
    </span>
  );

  const hasActions = !!(actions || onEdit);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex-1 min-w-48">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            leftAdornment={
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        {filters}
        <div className="flex items-center gap-2 ml-auto">
          {selectable && selected.size > 0 && onBulkDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => { onBulkDelete([...selected]); setSelected(new Set()); }}
            >
              Delete ({selected.size})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {selectable && (
                <th className="pl-4 pr-2 py-3.5 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={clsx(
                    'px-4 py-3.5 text-[0.85rem] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap',
                    'font-[Inter,ui-sans-serif,system-ui,sans-serif]',
                    col.width
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.sortable !== false ? (
                      <button
                        className="flex items-center gap-1 hover:text-slate-800 transition-colors"
                        onClick={() => handleSort(String(col.key))}
                      >
                        {col.header}
                        <SortIcon col={String(col.key)} />
                      </button>
                    ) : col.header}
                    {col.filterable !== false && (
                      <button
                        className={clsx(
                          'p-0.5 rounded hover:bg-slate-200 transition-colors',
                          colFilters[String(col.key)] ? 'text-indigo-600' : 'text-slate-400'
                        )}
                        onClick={e => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const key = String(col.key);
                          if (filterAnchor?.key === key) {
                            setFilterAnchor(null);
                          } else {
                            setFilterAnchor({
                              key,
                              top: rect.bottom + window.scrollY + 4,
                              left: rect.left + window.scrollX,
                            });
                          }
                        }}
                      >
                        <svg className="h-4 w-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {hasActions && (
                <th className="px-4 py-3.5 text-[0.85rem] font-bold text-slate-600 uppercase tracking-widest font-[Inter,ui-sans-serif,system-ui,sans-serif]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {selectable && <td className="pl-4 pr-2 py-3"><div className="h-4 w-4 bg-slate-100 rounded animate-pulse" /></td>}
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                  {hasActions && <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>}
                </tr>
              ))
            ) : processed.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-base text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              processed.map((row, idx) => {
                const rowId = String(getValue(row, String(keyField)));
                return (
                  <tr
                    key={rowId}
                    className={clsx(
                      'transition-colors duration-100',
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                      'hover:bg-indigo-50/40',
                      selected.has(rowId) && 'bg-indigo-50'
                    )}
                  >
                    {selectable && (
                      <td className="pl-4 pr-2 py-3">
                        <input type="checkbox" checked={selected.has(rowId)} onChange={() => toggleRow(rowId)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={String(col.key)} className="px-4 py-3.5 text-[0.95rem] text-slate-800 whitespace-nowrap">
                        {col.render ? col.render(row) : String(getValue(row, String(col.key)) ?? '—')}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          {actions && actions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[0.95rem] text-slate-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalRows ?? 0)} of {totalRows ?? 0}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="xs" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>← Prev</Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={clsx(
                    'w-8 h-8 text-[0.95rem] rounded-lg transition-colors',
                    p === page
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {p}
                </button>
              );
            })}
            <Button variant="ghost" size="xs" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next →</Button>
          </div>
        </div>
      )}

      {/* Filter dropdown portal */}
      {filterAnchor && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setFilterAnchor(null)}
          />
          <div
            className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2 min-w-40"
            style={{ top: filterAnchor.top - window.scrollY, left: filterAnchor.left - window.scrollX }}
          >
            <input
              autoFocus
              type="text"
              placeholder={`Filter ${columns.find(c => String(c.key) === filterAnchor.key)?.header ?? filterAnchor.key}…`}
              value={colFilters[filterAnchor.key] ?? ''}
              onChange={e => setColFilters(p => ({ ...p, [filterAnchor.key]: e.target.value }))}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            {colFilters[filterAnchor.key] && (
              <button
                className="mt-1 text-xs text-rose-500 hover:text-rose-700"
                onClick={() => { setColFilters(p => ({ ...p, [filterAnchor.key]: '' })); setFilterAnchor(null); }}
              >
                Clear filter
              </button>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
