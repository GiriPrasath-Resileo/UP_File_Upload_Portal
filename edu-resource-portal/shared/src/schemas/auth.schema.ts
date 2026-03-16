import { z } from 'zod';

export const LoginSchema = z.object({
  userId:   z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateUserSchema = z.object({
  userId:        z.string().min(3).max(50),
  password:      z.string().min(8),
  role:          z.enum(['ADMIN', 'UPLOADER']),
  districtScope: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  role:          z.enum(['ADMIN', 'UPLOADER']).optional(),
  districtScope: z.string().optional(),
  isActive:      z.boolean().optional(),
});

export type LoginData      = z.infer<typeof LoginSchema>;
export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
