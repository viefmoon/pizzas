import { z } from "zod";
import { baseListQuerySchema } from "../../../app/types/query.types";
import {
  ModifierGroup,
  modifierGroupApiSchema,
} from "../../modifiers/types/modifierGroup.types";


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

// Esquema base sin el refine, para poder extenderlo
const productSchemaBase = z.object({
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
  modifierGroupIds: z.array(z.string().uuid()).optional(),
});

// Esquema para el formulario, con la validación condicional
export const productSchema = productSchemaBase.superRefine((data, ctx) => {
  if (data.hasVariants) {
    // Si tiene variantes, el precio no es requerido, pero debe haber al menos una variante
    if (!data.variants || data.variants.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe añadir al menos una variante si marca esta opción.',
        path: ['variants'], // Asociar el error al campo de variantes
      });
    }
    // Asegurarse de que el precio principal sea null si hay variantes
    if (data.price !== null && data.price !== undefined) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El precio principal debe estar vacío si el producto tiene variantes.',
        path: ['price'],
      });
    }
  } else {
    // Si no tiene variantes, el precio es requerido
    if (data.price === null || data.price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El precio es requerido si el producto no tiene variantes.',
        path: ['price'], // Asociar el error al campo de precio
      });
    }
    // Asegurarse de que el array de variantes esté vacío si no tiene variantes
     if (data.variants && data.variants.length > 0) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'No debe haber variantes si el producto no está marcado como "Tiene Variantes".',
        path: ['variants'],
      });
    }
  }
});

export type ProductFormInputs = z.infer<typeof productSchema>;

// Esquema para la respuesta de la API, extendiendo el base
export const productResponseSchema = productSchemaBase.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  photo: photoSchema.optional().nullable(),
  variants: z
    .array(productVariantSchema.extend({ id: z.string().uuid() }))
    .optional(),
  modifierGroups: z.array(modifierGroupApiSchema).optional(),
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