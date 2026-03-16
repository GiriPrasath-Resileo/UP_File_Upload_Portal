import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FileDropZone } from './FileDropZone';
import { ProgressBar } from '../common/ProgressBar';
import { useBulkUpload } from '../../hooks/useUploads';
import { downloadTemplate } from '../../services/uploadService';
import { useToast } from '../common/Toast';

interface BulkUploadModalProps {
  open:    boolean;
  onClose: () => void;
}

export function BulkUploadModal({ open, onClose }: BulkUploadModalProps) {
  const [excelFiles, setExcelFiles] = useState<File[]>([]);
  const [pdfFiles,   setPdfFiles]   = useState<File[]>([]);
  const [step,       setStep]       = useState<'upload' | 'result'>('upload');
  const bulkUpload = useBulkUpload();
  const { showToast } = useToast();

  async function handleDownloadTemplate() {
    try {
      await downloadTemplate();
      showToast('Template downloaded', 'success');
    } catch {
      showToast('Failed to download template', 'error');
    }
  }

  async function handleSubmit() {
    if (!excelFiles[0]) return;
    const result = await bulkUpload.mutateAsync({ excelFile: excelFiles[0], pdfFiles });
    setStep('result');
    void result;
  }

  function handleClose() {
    setExcelFiles([]);
    setPdfFiles([]);
    setStep('upload');
    bulkUpload.reset();
    onClose();
  }

  const total = (bulkUpload.data?.success ?? 0) + (bulkUpload.data?.failed.length ?? 0);
  const successPct = total > 0 ? Math.round(((bulkUpload.data?.success ?? 0) / total) * 100) : 0;

  return (
    <Modal open={open} onClose={handleClose} title="Bulk Upload" size="xl">
      {step === 'upload' ? (
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Instructions */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
            <div className="text-indigo-600 mt-0.5">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-indigo-800">
              <p className="font-semibold mb-1">How bulk upload works:</p>
              <ol className="list-decimal list-inside space-y-1 text-indigo-700">
                <li>Download the Excel template and fill in the metadata for each row</li>
                <li>Name each PDF file to match the <code className="bg-indigo-100 px-1 rounded">pdfFileName</code> column</li>
                <li>Upload the completed Excel file and all PDF files together</li>
              </ol>
            </div>
          </div>

          {/* Download Template */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-slate-800">Step 1: Download Template</p>
              <p className="text-xs text-slate-500 mt-0.5">Get the Excel template with all required columns and a sample row</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Download Template
            </Button>
          </div>

          {/* Excel Upload */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Step 2: Upload Filled Excel</p>
            <FileDropZone
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              files={excelFiles}
              onChange={setExcelFiles}
              label=""
            />
          </div>

          {/* PDF Upload */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Step 3: Upload PDF Files</p>
            <FileDropZone
              accept="application/pdf"
              multiple
              files={pdfFiles}
              onChange={setPdfFiles}
              label=""
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              loading={bulkUpload.isPending}
              disabled={!excelFiles[0]}
            >
              Process Bulk Upload
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-6 py-5 flex flex-col gap-5">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
              (bulkUpload.data?.failed.length ?? 0) === 0
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-amber-100 text-amber-600'
            }`}>
              {(bulkUpload.data?.failed.length ?? 0) === 0 ? (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Bulk Upload Complete</h3>
          </div>

          <ProgressBar
            value={successPct}
            label={`${bulkUpload.data?.success ?? 0} of ${total} records succeeded`}
            color={successPct === 100 ? 'emerald' : 'amber'}
            showPct
          />

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{bulkUpload.data?.success ?? 0}</p>
              <p className="text-xs text-emerald-600 mt-1">Succeeded</p>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-rose-700">{bulkUpload.data?.failed.length ?? 0}</p>
              <p className="text-xs text-rose-600 mt-1">Failed</p>
            </div>
          </div>

          {/* Failed rows */}
          {(bulkUpload.data?.failed.length ?? 0) > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Failed Records</h4>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {bulkUpload.data?.failed.map((f, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-start gap-3">
                    <span className="text-rose-500 flex-shrink-0">✕</span>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{f.pdfFileName}</p>
                      <p className="text-xs text-rose-600">{f.error}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parse errors */}
          {(bulkUpload.data?.parseErrors.length ?? 0) > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Excel Parse Errors</h4>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {bulkUpload.data?.parseErrors.map((e, i) => (
                  <div key={i} className="px-4 py-2.5">
                    <p className="text-xs font-medium text-slate-700">Row {e.rowIndex}</p>
                    {e.errors.map((msg, j) => <p key={j} className="text-xs text-rose-600">{msg}</p>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
