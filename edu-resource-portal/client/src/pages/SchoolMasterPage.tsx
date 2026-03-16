import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SchoolMappingSchema, type SchoolMappingData } from '@edu-portal/shared';
import { DataTable, type Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FileDropZone } from '../components/upload/FileDropZone';
import {
  useAllSchools, useCreateSchool, useUpdateSchool, useDeleteSchool,
} from '../hooks/useSchools';
import { ingestSchoolsExcel } from '../services/schoolService';
import { useToast } from '../components/common/Toast';
import { fmtDate } from '../utils/formatters';
import type { School } from '../types/school.types';

export function SchoolMasterPage() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<School | null>(null);
  const [editTarget, setEditTarget] = useState<School | null>(null);
  const [ingestFile, setIngestFile] = useState<File[]>([]);
  const [ingesting, setIngesting] = useState(false);

  const { data: schoolsData, isLoading } = useAllSchools({ page, limit: 20, search });
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const deleteSchool = useDeleteSchool();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SchoolMappingData>({
    resolver: zodResolver(SchoolMappingSchema),
  });

  function openCreate() {
    reset({});
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(school: School) {
    setEditTarget(school);
    setValue('schoolName',   school.name);
    setValue('udiseCode',    school.udiseCode);
    setValue('boardCode',    school.boardCode);
    setValue('placeName',    school.placeName);
    setValue('blockName',    school.block);
    setValue('districtName', school.district);
    setFormOpen(true);
  }

  async function onSubmit(data: SchoolMappingData) {
    if (editTarget) {
      await updateSchool.mutateAsync({ id: editTarget.id, data });
    } else {
      await createSchool.mutateAsync(data);
    }
    setFormOpen(false);
    reset();
  }

  async function handleIngest() {
    if (!ingestFile[0]) return;
    setIngesting(true);
    try {
      const result = await ingestSchoolsExcel(ingestFile[0]);
      showToast(`Ingested: ${result.created} created, ${result.skipped} skipped`, 'success');
      setIngestOpen(false);
      setIngestFile([]);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIngesting(false);
    }
  }

  const COLUMNS: Column<School>[] = [
    { key: 'name',      header: 'School Name' },
    { key: 'udiseCode', header: 'UDISE Code', render: r => <span className="font-mono text-xs">{r.udiseCode}</span> },
    { key: 'boardCode', header: 'Board' },
    { key: 'block',     header: 'Block' },
    { key: 'district',  header: 'District' },
    { key: 'placeName', header: 'Place' },
    { key: 'createdAt', header: 'Added On', render: r => fmtDate(r.createdAt) },
  ];

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">School Master</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage the school directory</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIngestOpen(true)}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            Import Excel
          </Button>
          <Button size="sm" onClick={openCreate}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add School
          </Button>
        </div>
      </div>

      <DataTable<School>
        data={schoolsData?.data ?? []}
        columns={COLUMNS}
        keyField="id"
        loading={isLoading}
        totalRows={schoolsData?.total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onSearch={s => { setSearch(s); setPage(1); }}
        searchPlaceholder="Search schools, UDISE code…"
        exportFilename="schools"
        emptyMessage="No schools found. Add schools or import via Excel."
        actions={row => (
          <>
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Edit"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
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
          </>
        )}
      />

      {/* Create/Edit Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editTarget ? 'Edit School' : 'Add School'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input {...register('districtName')} label="District" required error={errors.districtName?.message} placeholder="e.g. Lucknow" />
            <Input {...register('blockName')}    label="Block"     required error={errors.blockName?.message}    placeholder="e.g. Chinhat" />
            <Input {...register('placeName')}    label="Place"     required error={errors.placeName?.message}    placeholder="e.g. Chinhat" />
            <Input {...register('boardCode')}    label="Board"     required error={errors.boardCode?.message}    placeholder="e.g. UP_BOARD" />
            <div className="col-span-2">
              <Input {...register('schoolName')} label="School Name" required error={errors.schoolName?.message} placeholder="Full school name" />
            </div>
            <div className="col-span-2">
              <Input {...register('udiseCode')}  label="UDISE Code (11 digits)" required error={errors.udiseCode?.message} placeholder="09150101001" maxLength={11} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createSchool.isPending || updateSchool.isPending}>
              {editTarget ? 'Save Changes' : 'Add School'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Ingest Modal */}
      <Modal open={ingestOpen} onClose={() => setIngestOpen(false)} title="Import Schools from Excel" size="md">
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-800">
            <p className="font-semibold mb-1">Required Excel columns:</p>
            <p className="font-mono text-xs">districtName, blockName, placeName, boardCode, schoolName, udiseCode</p>
          </div>
          <FileDropZone
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            files={ingestFile}
            onChange={setIngestFile}
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIngestOpen(false)}>Cancel</Button>
            <Button onClick={handleIngest} loading={ingesting} disabled={!ingestFile[0]}>Import</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteSchool.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete School"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteSchool.isPending}
      />
    </div>
  );
}
