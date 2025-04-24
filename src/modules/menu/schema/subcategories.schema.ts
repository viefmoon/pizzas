import { z } from "zod";
import { baseListQuerySchema } from "../../../app/types/api.types"; // Keep import for base schema
// Importar tipos de dominio centralizados
import { photoSchema, type Photo } from "../../../app/schemas/domain/photo.schema"; // Importar Photo y photoSchema
// Importar el tipo SubCategory centralizado
import type { SubCategory } from "../../../app/schemas/domain/subcategory.schema";

// --- Schema Zod para la entidad (eliminado, se usa el centralizado) ---

// --- DTOs (Data Transfer Objects) para la API ---

// Create DTO
export const createSubCategoryDtoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(), // Permitir null explícito
  isActive: z.boolean().optional().default(true),
  categoryId: z.string().uuid("Debe seleccionar una categoría válida"),
  photoId: z.string().uuid().optional().nullable(), // Permitir null para no asignar foto
  // Campo temporal para la URI de la imagen en GenericFormModal
  imageUri: z.string().nullable().optional(), // No se envía a la API, se usa para la lógica de subida/preview
});
export type CreateSubCategoryDto = z.infer<typeof createSubCategoryDtoSchema>;

// Update DTO
// Hacer todos los campos opcionales para la actualización parcial
export const updateSubCategoryDtoSchema = createSubCategoryDtoSchema.partial().extend({
    // photoId puede ser string (nuevo ID), null (quitar foto), o undefined (no cambiar foto)
    photoId: z.string().uuid().nullable().optional(),
    // imageUri sigue siendo opcional y temporal para el form
    imageUri: z.string().nullable().optional(),
});
export type UpdateSubCategoryDto = z.infer<typeof updateSubCategoryDtoSchema>;


// Find All Query DTO
export const findAllSubCategoriesDtoSchema = baseListQuerySchema.extend({
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});
// No se necesita un tipo inferido específico si se usa directamente z.infer donde se necesite


// --- Form Inputs ---
// Usar los DTOs como base para los tipos de formulario, ya que coinciden
export type SubCategoryFormInputs = CreateSubCategoryDto;
export type UpdateSubCategoryFormInputs = UpdateSubCategoryDto;

// Re-exportar tipos de dominio
export type { Photo, SubCategory }; // Re-exportar Photo y SubCategory centralizados
