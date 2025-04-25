import { z } from "zod";
import type { Category } from "../../../app/schemas/domain/category.schema";
import { type Photo } from "../../../app/schemas/domain/photo.schema"; // Eliminado photoSchema no usado

export const createCategoryDtoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  photoId: z.string().uuid().optional().nullable(),
});

export const updateCategoryDtoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  photoId: z.string().uuid().optional().nullable(),
});

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

export type CreateCategoryDto = z.infer<typeof createCategoryDtoSchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategoryDtoSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;

export type { Category, Photo };
