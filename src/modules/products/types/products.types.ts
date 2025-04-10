import { z } from 'zod';
import { baseListQuerySchema } from '../../../app/types/query.types';


export const photoSchema = z.object({
  id: z.string().uuid(),
  path: z.string().url(),
});
export type Photo = z.infer<typeof photoSchema>;

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  price: z.coerce // Usar coerce para intentar convertir a número primero
    .number({
      invalid_type_error: 'El precio debe ser un número',
      required_error: 'El precio es requerido',
    })
    .positive('El precio debe ser positivo')
    .refine(val => /^\d+(\.\d{1,2})?$/.test(String(val)), {
      message: 'El precio debe tener como máximo dos decimales'
    }),
  isActive: z.boolean(),
});
export type ProductVariantInput = z.infer<typeof productVariantSchema>;

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  price: z.number().positive('El precio debe ser positivo').refine(val => {
    // Permite hasta 2 decimales
    return /^\d+(\.\d{1,2})?$/.test(String(val));
  }, { message: 'El precio debe tener como máximo dos decimales' }).optional().nullable(),
  hasVariants: z.boolean(),
  isActive: z.boolean(),
  subCategoryId: z.string().uuid('La subcategoría es requerida'),
  photoId: z.string().uuid().optional().nullable(), // ID de la foto guardada en backend
  imageUri: z.string().url().or(z.string().startsWith('file://')).optional().nullable(), // URI para el picker (local o remota)
  estimatedPrepTime: z.number().min(1, 'El tiempo debe ser al menos 1 minuto'),
  preparationScreenId: z.string().uuid().optional().nullable(),
  variants: z.array(productVariantSchema).optional(),
  variantsToDelete: z.array(z.string().uuid()).optional(),
});

export type ProductFormInputs = z.infer<typeof productSchema>;

export const productResponseSchema = productSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  photo: photoSchema.optional().nullable(),
  variants: z.array(productVariantSchema.extend({ id: z.string().uuid() })).optional(),
});
export type Product = z.infer<typeof productResponseSchema>;

export const productsListResponseSchema = z.tuple([
  z.array(productResponseSchema),
  z.number(),
]);
export type ProductsListResponse = z.infer<typeof productsListResponseSchema>;

export const findAllProductsQuerySchema = baseListQuerySchema.extend({
  subCategoryId: z.string().uuid().optional(),
  hasVariants: z.boolean().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});
export type FindAllProductsQuery = z.infer<typeof findAllProductsQuerySchema>;

export const assignModifierGroupsSchema = z.object({
  modifierGroupIds: z.array(z.string().uuid()).min(1, 'Se requiere al menos un ID de grupo'),
});
export type AssignModifierGroupsInput = z.infer<typeof assignModifierGroupsSchema>;