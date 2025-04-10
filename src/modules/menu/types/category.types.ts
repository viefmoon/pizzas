import { z } from 'zod';


/**
 * Representa la estructura de una foto asociada a una categoría.
 */
export interface CategoryPhoto {
  id: string;
  path: string;
}

/**
 * Representa una categoría del menú.
 */
export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  photo: CategoryPhoto | null;
}

/**
 * Estructura genérica para respuestas paginadas de la API.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}



export type ActiveFilter = "all" | "active" | "inactive";


/**
 * Esquema Zod para validar la estructura de una foto de categoría.
 */
export const categoryPhotoSchema = z.object({
  id: z.string(),
  path: z.string().url().or(z.string().startsWith('/')),
});

/**
 * Esquema Zod para validar un objeto Category completo.
 */
export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  photo: categoryPhotoSchema.nullable().optional(),
});

/**
 * Esquema Zod para validar los datos al crear una nueva categoría (DTO).
 * La foto se maneja por ID si ya fue subida, o se omite si no hay/se subirá después.
 */
export const createCategoryDtoSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  photoId: z.string().uuid().optional().nullable(),
});

/**
 * Esquema Zod para validar los datos al actualizar una categoría (DTO).
 * Todos los campos son opcionales. photoId: null significa quitar la foto.
 */
export const updateCategoryDtoSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  photoId: z.string().uuid().optional().nullable(),
});


/**
 * Esquema Zod para los datos del formulario de Añadir/Editar Categoría.
 * El campo 'image' manejará la URI de la imagen seleccionada o existente.
 * Podría ser null si no hay imagen, o una string (URI) si hay una.
 */
export const categoryFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional().nullable(),
  isActive: z.boolean(),
  imageUri: z.string().url().or(z.string().startsWith('file://')).nullable().optional(),
});



export type CreateCategoryDto = z.infer<typeof createCategoryDtoSchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategoryDtoSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;