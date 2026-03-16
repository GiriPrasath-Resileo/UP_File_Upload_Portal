import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { DataTable, type Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { RadioGroup } from '../components/common/RadioGroup';
import { UploadModal } from '../components/upload/UploadModal';
import { BulkUploadModal } from '../components/upload/BulkUploadModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge, statusBadge } from '../components/common/Badge';
import { useUploadStats, useUploads, useDeleteUpload, useUpdateUpload } from '../hooks/useUploads';
import { getPresignedUrl } from '../services/uploadService';
import { useAuthStore } from '../store/authStore';
import { fmtDate, fmtEnum } from '../utils/formatters';
import { useToast } from '../components/common/Toast';
import { MEDIUMS, SUBJECTS, SAMPLE_TYPES, GENDERS, HANDS, GRADES, PRIMARY_GRADES } from '../utils/constants';
import type { Upload } from '../types/upload.types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'COMPLETED',  label: 'Completed' },
  { value: 'PENDING',    label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'FAILED',     label: 'Failed' },
];

export function DashboardPage() {
  const isAdmin = useAuthStore(s => s.isAdmin());
  const { showToast } = useToast();

  const [uploadOpen,     setUploadOpen]     = useState(false);
  const [bulkOpen,       setBulkOpen]       = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState<Upload | null>(null);
  const [editTarget,     setEditTarget]     = useState<Upload | null>(null);
  const [page,           setPage]           = useState(1);
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  const [editForm, setEditForm] = useState<{
    medium: string;
    classGrade: string;
    subject: string;
    sampleType: string;
    gender: string;
    dominantHand: string;
  }>({ medium: '', classGrade: '', subject: '', sampleType: '', gender: '', dominantHand: '' });

  useEffect(() => {
    if (editTarget) {
      setEditForm({
        medium:       editTarget.medium       ?? '',
        classGrade:   editTarget.classGrade   ?? '',
        subject:      editTarget.subject      ?? '',
        sampleType:   editTarget.sampleType   ?? '',
        gender:       editTarget.gender       ?? '',
        dominantHand: editTarget.dominantHand ?? '',
      });
    }
  }, [editTarget]);

  const { data: stats, isLoading: statsLoading } = useUploadStats();
  const { data: uploadsData, isLoading: tableLoading } = useUploads({
    page, limit: 20, search, status: statusFilter || undefined, district: districtFilter || undefined,
  });
  const deleteMutation = useDeleteUpload();
  const updateMutation = useUpdateUpload();

  async function handleViewFile(row: Upload) {
    try {
      const url = await getPresignedUrl(row.id);
      window.open(url, '_blank');
    } catch {
      showToast('Failed to get download link', 'error');
    }
  }

  const COLUMNS: Column<Upload>[] = [
    {
      key: 'fileNumber',
      header: 'File No.',
      render: r => (
        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
          {r.fileNumber}
        </span>
      ),
    },
    { key: 'district',   header: 'District' },
    { key: 'block',      header: 'Block' },
    { key: 'schoolName', header: 'School', render: r => <span className="max-w-40 truncate block" title={r.schoolName}>{r.schoolName}</span> },
    { key: 'medium',     header: 'Medium',  render: r => <Badge variant="default">{fmtEnum(r.medium)}</Badge> },
    { key: 'classGrade', header: 'Class' },
    { key: 'subject',    header: 'Subject',  render: r => fmtEnum(r.subject) },
    { key: 'sampleType', header: 'Type',     render: r => <span className="text-xs text-slate-500">{fmtEnum(r.sampleType)}</span> },
    { key: 'gender',     header: 'Gender',   render: r => fmtEnum(r.gender) },
    { key: 'dominantHand', header: 'Hand',   render: r => fmtEnum(r.dominantHand) },
    { key: 'createdAt',  header: 'Date',     render: r => fmtDate(r.createdAt) },
    { key: 'status',     header: 'Status',   render: r => statusBadge(r.status), filterable: false },
  ];

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-[0.95rem] text-slate-500 mt-1">Manage and track all resource uploads</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkOpen(true)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            Bulk Upload
          </Button>
          <Button
            size="sm"
            onClick={() => setUploadOpen(true)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New Upload
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Uploads"
          value={stats?.total ?? 0}
          loading={statsLoading}
          color="indigo"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          }
        />
        <StatCard
          title="Today's Uploads"
          value={stats?.today ?? 0}
          loading={statsLoading}
          color="emerald"
          subtitle="Since midnight"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Schools Covered"
          value={stats?.schools ?? 0}
          loading={statsLoading}
          color="amber"
          subtitle="Unique schools"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          title="Next File No."
          value={stats?.nextFileNumber ?? '—'}
          loading={statsLoading}
          color="sky"
          subtitle="Sequential counter"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          }
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            placeholder="All Statuses"
          />
        </div>
        <div className="w-44">
          <input
            type="text"
            placeholder="Filter by district…"
            value={districtFilter}
            onChange={e => { setDistrictFilter(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-[0.95rem] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable<Upload>
        data={uploadsData?.data ?? []}
        columns={COLUMNS}
        keyField="id"
        loading={tableLoading}
        totalRows={uploadsData?.total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onSearch={s => { setSearch(s); setPage(1); }}
        searchPlaceholder="Search file number, district, school…"
        selectable={isAdmin}
        exportFilename="uploads"
        emptyMessage="No uploads found. Click 'New Upload' to get started."
        onEdit={row => setEditTarget(row)}
        actions={row => (
          <>
            <button
              onClick={() => handleViewFile(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="View PDF"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            {isAdmin && (
              <button
                onClick={() => setDeleteTarget(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </>
        )}
      />

      {/* Modals */}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <BulkUploadModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Upload"
        message={`Are you sure you want to delete ${deleteTarget?.fileNumber}? This will also delete the file from S3. This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />

      {/* Edit Upload Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit Upload — ${editTarget?.fileNumber}`} size="lg">
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Read-only info row */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-sm">
            <div><span className="text-slate-400 text-xs">District</span><p className="font-medium">{editTarget?.district}</p></div>
            <div><span className="text-slate-400 text-xs">School</span><p className="font-medium truncate">{editTarget?.schoolName}</p></div>
            <div><span className="text-slate-400 text-xs">UDISE</span><p className="font-mono text-xs">{editTarget?.udiseCode}</p></div>
          </div>
          {/* Editable selects */}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Medium" options={MEDIUMS} value={editForm.medium} onChange={e => setEditForm(f => ({ ...f, medium: e.target.value }))} />
            <Select label="Class / Grade" options={GRADES} value={editForm.classGrade} onChange={e => setEditForm(f => ({ ...f, classGrade: e.target.value }))} />
            <Select label="Subject" options={SUBJECTS} value={editForm.subject} onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))} />
            <Select
              label="Sample Type"
              options={SAMPLE_TYPES.map(st => ({ ...st, disabled: st.value === 'CURSIVE_WRITING_NOTEBOOKS' && !PRIMARY_GRADES.includes(editForm.classGrade) }))}
              value={editForm.sampleType}
              onChange={e => setEditForm(f => ({ ...f, sampleType: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <RadioGroup name="edit-gender" label="Gender" options={GENDERS} value={editForm.gender} onChange={v => setEditForm(f => ({ ...f, gender: v }))} inline />
            <RadioGroup name="edit-hand" label="Dominant Hand" options={HANDS} value={editForm.dominantHand} onChange={v => setEditForm(f => ({ ...f, dominantHand: v }))} inline />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button loading={updateMutation.isPending} onClick={() => {
              if (!editTarget) return;
              updateMutation.mutate({ id: editTarget.id, data: editForm }, { onSuccess: () => setEditTarget(null) });
            }}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
