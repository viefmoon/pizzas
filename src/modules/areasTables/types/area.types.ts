import { z } from 'zod';

export const AreaSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const UpdateAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type Area = z.infer<typeof AreaSchema>;
export type CreateAreaDto = z.infer<typeof CreateAreaSchema>;
export type UpdateAreaDto = z.infer<typeof UpdateAreaSchema>;

export const FindAllAreasSchema = z.object({
    name: z.string().optional(),
    isActive: z.boolean().optional(),
});
export type FindAllAreasDto = z.infer<typeof FindAllAreasSchema>;