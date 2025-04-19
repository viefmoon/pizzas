import { z } from "zod";

/**
 * Esquema Zod para validar la estructura de una foto de categoría.
 */
export const categoryPhotoSchema = z.object({
  id: z.string(),
  path: z.string(),
});

/**
 * Esquema Zod para validar un objeto Category completo.
 */
export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  photo: categoryPhotoSchema.nullable().optional(),
});

/**
 * Esquema Zod para validar los datos al crear una nueva categoría (DTO).
 * La foto se maneja por ID si ya fue subida, o se omite si no hay/se subirá después.
 */
export const createCategoryDtoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  photoId: z.string().uuid().optional().nullable(),
});

/**
 * Esquema Zod para validar los datos al actualizar una categoría (DTO).
 * Todos los campos son opcionales. photoId: null significa quitar la foto.
 */
export const updateCategoryDtoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  photoId: z.string().uuid().optional().nullable(),
});

/**
 * Esquema Zod para los datos del formulario de Añadir/Editar Categoría.
 * El campo 'imageUri' manejará la URI de la imagen seleccionada o existente.
 * Podría ser null si no hay imagen, o una string (URI) si hay una.
 */
export const categoryFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  imageUri: z
    .string()
    .url()
    .or(z.string().startsWith("file://"))
    .nullable()
    .optional(),
});

// Inferred types
export type CreateCategoryDto = z.infer<typeof createCategoryDtoSchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategoryDtoSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
// Note: The 'Category' type itself is defined as an interface in category.types.ts
// but if an inferred type from categorySchema is needed, it can be defined here:
// export type InferredCategory = z.infer<typeof categorySchema>;
