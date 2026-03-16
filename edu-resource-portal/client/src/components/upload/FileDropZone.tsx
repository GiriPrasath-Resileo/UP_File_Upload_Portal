import React, { useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { fmtBytes } from '../../utils/formatters';

interface FileDropZoneProps {
  accept?:   string;
  multiple?: boolean;
  maxSizeMb?: number;
  onChange:  (files: File[]) => void;
  files?:    File[];
  error?:    string;
  label?:    string;
}

export function FileDropZone({ accept = 'application/pdf', multiple = false, maxSizeMb = 100, onChange, files = [], error, label }: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(f => {
      if (f.size > maxSizeMb * 1024 * 1024) return false;
      if (accept && !accept.split(',').some(a => f.type === a.trim())) return false;
      return true;
    });
    onChange(multiple ? [...files, ...valid] : valid.slice(0, 1));
  }, [accept, files, maxSizeMb, multiple, onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer',
          dragging
            ? 'border-indigo-400 bg-indigo-50'
            : error
            ? 'border-rose-300 bg-rose-50/40 hover:border-rose-400'
            : 'border-slate-300 bg-slate-50/40 hover:border-indigo-400 hover:bg-indigo-50/30'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {dragging ? 'Drop here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {accept === 'application/pdf' ? 'PDF' : accept.split(',').join(', ').toUpperCase()} up to {maxSizeMb}MB
              {multiple && ' — multiple files allowed'}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      {files.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <svg className="h-4 w-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-slate-700 flex-1 truncate">{f.name}</span>
              <span className="text-xs text-slate-400 flex-shrink-0">{fmtBytes(f.size)}</span>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeFile(i); }}
                className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
