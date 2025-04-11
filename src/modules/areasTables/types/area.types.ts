import { z } from 'zod';

// Esquema base para Area (coincide con el dominio del backend si es posible)
export const AreaSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime().optional(), // Asumiendo que vienen como string
  updatedAt: z.string().datetime().optional(),
});

// Esquema para crear un Area
export const CreateAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

// Esquema para actualizar un Area
export const UpdateAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Tipos inferidos
export type Area = z.infer<typeof AreaSchema>;
export type CreateAreaDto = z.infer<typeof CreateAreaSchema>;
export type UpdateAreaDto = z.infer<typeof UpdateAreaSchema>;

// Tipo para filtros (basado en FindAllAreasDto)
export const FindAllAreasSchema = z.object({
    name: z.string().optional(),
    isActive: z.boolean().optional(),
});
export type FindAllAreasDto = z.infer<typeof FindAllAreasSchema>;