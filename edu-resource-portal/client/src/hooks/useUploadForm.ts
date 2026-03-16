import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadFormSchema, type UploadFormData } from '@edu-portal/shared';
import { useDistricts, useBlocks, useSchoolsForBlock } from './useSchools';

export function useUploadForm() {
  const form = useForm<UploadFormData>({
    resolver: zodResolver(UploadFormSchema),
    defaultValues: {
      district:     '',
      block:        '',
      place:        '',
      board:        '',
      schoolName:   '',
      udiseCode:    '',
      medium:       'HINDI',
      classGrade:   '',
      subject:      'HINDI',
      sampleType:   'NOTEBOOKS',
      gender:       'MALE',
      dominantHand: 'RIGHT',
    },
  });

  const district = form.watch('district');
  const block    = form.watch('block');

  const { data: districts = [], isLoading: loadingDistricts } = useDistricts();
  const { data: blocks    = [], isLoading: loadingBlocks     } = useBlocks(district);
  const { data: schools   = [], isLoading: loadingSchools    } = useSchoolsForBlock(district, block);

  // Reset downstream when district changes
  useEffect(() => {
    form.setValue('block', '');
    form.setValue('schoolName', '');
    form.setValue('udiseCode', '');
    form.setValue('place', '');
    form.setValue('board', '');
  }, [district, form]);

  // Reset school fields when block changes
  useEffect(() => {
    form.setValue('schoolName', '');
    form.setValue('udiseCode', '');
    form.setValue('place', '');
    form.setValue('board', '');
  }, [block, form]);

  function onSchoolSelect(schoolId: string) {
    const s = schools.find(x => x.id === schoolId);
    if (!s) return;
    form.setValue('schoolName', s.name);
    form.setValue('udiseCode',  s.udiseCode);
    form.setValue('place',      s.placeName);
    form.setValue('board',      s.boardCode);
  }

  return {
    form,
    districts,
    blocks,
    schools,
    loadingDistricts,
    loadingBlocks,
    loadingSchools,
    onSchoolSelect,
  };
}
