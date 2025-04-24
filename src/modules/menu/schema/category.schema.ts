import { z } from "zod";
// Importar tipos de dominio centralizados
import type { Category } from "../../../app/schemas/domain/category.schema";
import { photoSchema, type Photo } from "../../../app/schemas/domain/photo.schema"; // Importar Photo y photoSchema

// Schemas específicos para DTOs y Formularios permanecen aquí

/**
 * Esquema Zod para validar los datos al crear una nueva categoría (DTO).
 */
export const createCategoryDtoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  photoId: z.string().uuid().optional().nullable(),
});

/**
 * Esquema Zod para validar los datos al actualizar una categoría (DTO).
 */
export const updateCategoryDtoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  photoId: z.string().uuid().optional().nullable(),
});

/**
 * Esquema Zod para los datos del formulario de Añadir/Editar Categoría.
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

// Inferred types for DTOs and Forms
export type CreateCategoryDto = z.infer<typeof createCategoryDtoSchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategoryDtoSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;

// Re-exportar los tipos de dominio para conveniencia del módulo
// Renombrar CategoryPhoto a Photo para consistencia
export type { Category, Photo };
