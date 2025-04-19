import { z } from "zod";
import { baseListQuerySchema } from "../../../app/types/api.types"; // Keep import for base schema

// --- Domain ---
export const subCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  categoryId: z.string().uuid("El ID de categoría no es válido"),
  photo: z
    .object({
      id: z.string().uuid(),
      path: z.string().url(),
    })
    .nullable()
    .optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type SubCategory = z.infer<typeof subCategorySchema>;

// --- DTOs ---

// Create
export const createSubCategoryDtoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  categoryId: z.string().uuid("Debe seleccionar una categoría válida"),
  photoId: z.string().uuid().optional(),
  // Campo temporal para la URI de la imagen en GenericFormModal
  imageUri: z.string().nullable().optional(), // No se envía a la API, se usa para la lógica de subida/preview
});

export type CreateSubCategoryDto = z.infer<typeof createSubCategoryDtoSchema>;

// Update
export const updateSubCategoryDtoSchema = createSubCategoryDtoSchema.partial();
// Extender para permitir photoId: null (quitar foto) y mantener imageUri temporal
export const updateSubCategoryDtoSchemaWithOptionalPhoto =
  updateSubCategoryDtoSchema.extend({
    photoId: z.string().uuid().nullable().optional(),
    // Campo temporal para la URI de la imagen en GenericFormModal
    imageUri: z.string().nullable().optional(), // No se envía a la API
  });

export type UpdateSubCategoryDto = z.infer<
  typeof updateSubCategoryDtoSchemaWithOptionalPhoto
>;

// Find All Query
export const findAllSubCategoriesDtoSchema = baseListQuerySchema.extend({
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

// --- Form Inputs ---
// Los tipos de entrada del formulario coinciden con los DTOs de creación/actualización
export type SubCategoryFormInputs = CreateSubCategoryDto;
export type UpdateSubCategoryFormInputs = UpdateSubCategoryDto;
