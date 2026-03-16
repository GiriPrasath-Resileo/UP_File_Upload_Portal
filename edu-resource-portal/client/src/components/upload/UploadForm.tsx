import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Select } from '../common/Select';
import { RadioGroup } from '../common/RadioGroup';
import { Button } from '../common/Button';
import { FileDropZone } from './FileDropZone';
import { useUploadForm } from '../../hooks/useUploadForm';
import { useCreateUpload } from '../../hooks/useUploads';
import { GRADES, SUBJECTS, SAMPLE_TYPES, MEDIUMS, GENDERS, HANDS, PRIMARY_GRADES } from '../../utils/constants';
import type { UploadFormData } from '@edu-portal/shared';

interface UploadFormProps {
  onSuccess?: () => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [pdfFile, setPdfFile] = useState<File[]>([]);
  const { form, districts, blocks, schools, loadingBlocks, loadingSchools, onSchoolSelect } = useUploadForm();
  const createUpload = useCreateUpload();

  const { control, handleSubmit, watch, formState: { errors } } = form;
  const sampleType  = watch('sampleType');
  const classGrade  = watch('classGrade');

  // When Cursive Writing Notebooks is selected, show only Grades 1–5.
  const filteredGrades = sampleType === 'CURSIVE_WRITING_NOTEBOOKS'
    ? GRADES.filter(g => PRIMARY_GRADES.includes(g.value))
    : GRADES;

  // Cursive Writing Notebooks is only valid for Grades 1–5.
  // Disable the option (and show a tooltip) when a higher grade is already chosen.
  const cursiveAllowed = !classGrade || PRIMARY_GRADES.includes(classGrade);

  async function onSubmit(data: UploadFormData) {
    if (!pdfFile[0]) return;
    await createUpload.mutateAsync({ formData: data, file: pdfFile[0] });
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-5">
      {/* Location Section */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller name="district" control={control} render={({ field }) => (
            <Select
              {...field}
              label="District"
              required
              options={districts.map(d => ({ value: d, label: d }))}
              placeholder="Select district"
              error={errors.district?.message}
            />
          )} />
          <Controller name="block" control={control} render={({ field }) => (
            <Select
              {...field}
              label="Block"
              required
              options={blocks.map(b => ({ value: b, label: b }))}
              placeholder={loadingBlocks ? 'Loading…' : 'Select block'}
              disabled={!watch('district') || loadingBlocks}
              error={errors.block?.message}
            />
          )} />
        </div>
      </div>

      {/* School Section */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">School</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Select
              label="School"
              required
              options={schools.map(s => ({ value: s.id, label: `${s.name} (${s.udiseCode})` }))}
              placeholder={loadingSchools ? 'Loading…' : 'Select school'}
              disabled={!watch('block') || loadingSchools}
              onChange={e => onSchoolSelect(e.target.value)}
              error={errors.schoolName?.message}
            />
          </div>
          <Controller name="udiseCode" control={control} render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">UDISE Code</label>
              <input
                {...field}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-not-allowed"
              />
            </div>
          )} />
          <Controller name="board" control={control} render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Board</label>
              <input
                {...field}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-not-allowed"
              />
            </div>
          )} />
        </div>
      </div>

      {/* Academic Section */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Academic Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Controller name="medium" control={control} render={({ field }) => (
            <Select {...field} label="Medium" required options={MEDIUMS} error={errors.medium?.message} />
          )} />
          <Controller name="classGrade" control={control} render={({ field }) => (
            <Select
              {...field}
              label="Class / Grade"
              required
              options={filteredGrades}
              placeholder="Select grade"
              error={errors.classGrade?.message}
            />
          )} />
          <Controller name="subject" control={control} render={({ field }) => (
            <Select {...field} label="Subject" required options={SUBJECTS} error={errors.subject?.message} />
          )} />
        </div>
        <div className="mt-4">
          <Controller name="sampleType" control={control} render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Sample Type <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SAMPLE_TYPES.map(st => {
                  const isDisabled = st.value === 'CURSIVE_WRITING_NOTEBOOKS' && !cursiveAllowed;
                  return (
                    <label
                      key={st.value}
                      title={isDisabled ? 'Only available for Grade 1–5' : undefined}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-150 text-sm select-none ${
                        isDisabled
                          ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                          : field.value === st.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium cursor-pointer'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        {...field}
                        value={st.value}
                        disabled={isDisabled}
                        checked={field.value === st.value}
                        className="sr-only"
                      />
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        isDisabled
                          ? 'border-slate-200'
                          : field.value === st.value
                            ? 'border-indigo-500'
                            : 'border-slate-300'
                      }`}>
                        {field.value === st.value && !isDisabled && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                      </span>
                      {st.label}
                    </label>
                  );
                })}
              </div>
              {errors.sampleType && <p className="text-xs text-rose-500">{errors.sampleType.message}</p>}
            </div>
          )} />
        </div>
      </div>

      {/* Student Details */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Student Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Controller name="gender" control={control} render={({ field }) => (
            <RadioGroup
              name="gender"
              label="Gender"
              options={GENDERS}
              value={field.value}
              onChange={field.onChange}
              inline
              error={errors.gender?.message}
            />
          )} />
          <Controller name="dominantHand" control={control} render={({ field }) => (
            <RadioGroup
              name="dominantHand"
              label="Dominant Hand"
              options={HANDS}
              value={field.value}
              onChange={field.onChange}
              inline
              error={errors.dominantHand?.message}
            />
          )} />
        </div>
      </div>

      {/* File Upload */}
      <FileDropZone
        label="PDF File"
        accept="application/pdf"
        files={pdfFile}
        onChange={setPdfFile}
        error={!pdfFile[0] && createUpload.isError ? 'PDF file is required' : undefined}
        maxSizeMb={parseInt(import.meta.env.VITE_MAX_FILE_MB ?? '100')}
      />

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button
          type="submit"
          loading={createUpload.isPending}
          disabled={!pdfFile[0]}
          size="md"
        >
          Submit Upload
        </Button>
      </div>
    </form>
  );
}
