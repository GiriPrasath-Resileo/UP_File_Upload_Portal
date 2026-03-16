import { z } from 'zod';

export const SchoolMappingSchema = z.object({
  districtName: z.string().min(1),
  blockName:    z.string().min(1),
  placeName:    z.string().min(1),
  boardCode:    z.string().min(1),
  schoolName:   z.string().min(1),
  udiseCode:    z.string().min(11).max(11),
});

export type SchoolMappingData = z.infer<typeof SchoolMappingSchema>;
