import { z } from "zod";
import { baseListQuerySchema } from "../../../app/types/query.types";
// Importar tipos de dominio centralizados
import { photoSchema, type Photo } from "../../../app/schemas/domain/photo.schema";
import { productVariantSchema, type ProductVariant } from "../../../app/schemas/domain/product-variant.schema";
import { modifierGroupSchema } from "../../../app/schemas/domain/modifier-group.schema";
// Importar el tipo Product centralizado
import type { Product } from "../../../app/schemas/domain/product.schema";

// --- Schemas Zod ---

// Schema base local para el formulario (necesario para superRefine y campos extra como imageUri)
// y también como base para productResponseSchema
const productBaseSchema = z.object({
  id: z.string().uuid().optional(), // ID opcional para creación/formulario
  name: z.string().min(1, "El nombre es requerido"),
  price: z
    .number()
    .positive("El precio debe ser positivo")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(String(val)),
      { message: "El precio debe tener como máximo dos decimales" }
    )
    .optional()
    .nullable(),
  hasVariants: z.boolean(),
  isActive: z.boolean(),
  subcategoryId: z.string().uuid("La subcategoría es requerida"),
  photoId: z.string().uuid().optional().nullable(), // ID de la foto guardada en backend
  imageUri: z // Campo temporal para el formulario
    .string()
    .url()
    .or(z.string().startsWith("file://"))
    .optional()
    .nullable(),
  estimatedPrepTime: z.number().min(1, "El tiempo debe ser al menos 1 minuto").optional(),
  preparationScreenId: z.string().uuid().optional().nullable(),
  variants: z.array(productVariantSchema).optional(), // Usa el schema importado
  variantsToDelete: z.array(z.string().uuid()).optional(), // Para manejar eliminación en edición
  modifierGroupIds: z.array(z.string().uuid()).optional(), // IDs para asignar/actualizar
});


// Esquema para el formulario, con la validación condicional
export const productSchema = productBaseSchema.superRefine((data, ctx) => {
  if (data.hasVariants) {
    if (!data.variants || data.variants.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe añadir al menos una variante si marca esta opción.",
        path: ["variants"],
      });
    }
    if (data.price !== null && data.price !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El precio principal debe estar vacío si el producto tiene variantes.",
        path: ["price"],
      });
    }
  } else {
    if (data.price === null || data.price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El precio es requerido si el producto no tiene variantes.",
        path: ["price"],
      });
    }
    if (data.variants && data.variants.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'No debe haber variantes si el producto no está marcado como "Tiene Variantes".',
        path: ["variants"],
      });
    }
  }
});

// Tipo inferido para los inputs del formulario
export type ProductFormInputs = z.infer<typeof productSchema>;

// Esquema para la respuesta de la API, extendiendo el base local
// Este schema representa la estructura que devuelve el backend.
export const productResponseSchema = productBaseSchema.extend({
  id: z.string().uuid(), // ID es requerido en la respuesta
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  photo: photoSchema.optional().nullable(), // Usa el photoSchema importado del dominio
  variants: z
    .array(productVariantSchema) // Usa el schema importado (ya incluye id)
    .optional(),
  modifierGroups: z.array(modifierGroupSchema).optional(), // Usa schema importado del dominio
});
// Si se necesita el tipo específico inferido de esta respuesta:
// export type ProductApiResponse = z.infer<typeof productResponseSchema>;

// Esquema para la respuesta de lista paginada (si aplica)
export const productsListResponseSchema = z.tuple([
  z.array(productResponseSchema), // Usa el schema de respuesta definido arriba
  z.number(), // Count
]);
export type ProductsListResponse = z.infer<typeof productsListResponseSchema>;

// Esquema para los parámetros de query de búsqueda
export const findAllProductsQuerySchema = baseListQuerySchema.extend({
  subcategoryId: z.string().uuid().optional(),
  hasVariants: z.boolean().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});
export type FindAllProductsQuery = z.infer<typeof findAllProductsQuerySchema>;

// Esquema para asignar/desasignar grupos de modificadores
export const assignModifierGroupsSchema = z.object({
  modifierGroupIds: z
    .array(z.string().uuid())
    .min(1, "Se requiere al menos un ID de grupo"),
});
export type AssignModifierGroupsInput = z.infer<
  typeof assignModifierGroupsSchema
>;

// Re-exportar los tipos de dominio centralizados
export type { Photo, ProductVariant, Product }; // Añadir Product
