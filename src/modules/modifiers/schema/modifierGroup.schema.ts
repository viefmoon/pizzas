import { z } from "zod";
// Importar tipo de dominio centralizado
import { modifierGroupSchema as domainModifierGroupSchema } from "../../../app/schemas/domain/modifier-group.schema"; // Importar el schema Zod
import type { ModifierGroup } from "../../../app/schemas/domain/modifier-group.schema"; // Mantener importación de tipo

// Schema base local para validaciones y transformaciones de DTO/Form
const modifierGroupBaseSchemaForForm = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  minSelections: z.number().int().min(0).optional(),
  maxSelections: z.number().int().min(1).optional(),
  isRequired: z.boolean().optional(),
  allowMultipleSelections: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Schema de validación para el formulario (usa el schema base local)
export const modifierGroupFormValidationSchema =
  modifierGroupBaseSchemaForForm.superRefine((data, ctx) => {
    if (data.allowMultipleSelections) {
      if (data.maxSelections === undefined || data.maxSelections === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxSelections"],
          message:
            "Máx. selecciones es requerido si se permiten múltiples selecciones.",
        });
      } else {
        if (data.maxSelections <= 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxSelections"],
            message:
              "Máx. selecciones debe ser mayor que 1 si se permiten múltiples selecciones.",
          });
        }

        const min = data.minSelections ?? 0;
        if (data.maxSelections > 1 && min > data.maxSelections) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["minSelections"],
            message:
              "Mín. selecciones no puede ser mayor que Máx. selecciones.",
          });
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxSelections"],
            message:
              "Máx. selecciones no puede ser menor que Mín. selecciones.",
          });
        }
      }
    } else {
      // Si no se permiten múltiples selecciones, maxSelections debe ser 1
      // y minSelections debe ser 0 o 1 (dependiendo de isRequired)
      // Esta lógica puede ajustarse según las reglas de negocio exactas.
      // Por ahora, no añadimos validación extra aquí si allowMultipleSelections es false.
    }
  });

// Tipo inferido para el formulario
export type ModifierGroupFormInputs = z.infer<
  typeof modifierGroupFormValidationSchema
>;

// Schema para DTO de creación (usa el schema base local y transforma)
export const createModifierGroupSchema = modifierGroupBaseSchemaForForm.transform(
  (data) => ({
    ...data,
    minSelections: data.minSelections ?? 0,
    isRequired: data.isRequired ?? false,
    allowMultipleSelections: data.allowMultipleSelections ?? false,
    isActive: data.isActive ?? true,
    maxSelections: data.allowMultipleSelections ? (data.maxSelections ?? 1) : 1,
  })
);
// Tipo inferido para DTO de creación
export type CreateModifierGroupInput = z.infer<
  typeof createModifierGroupSchema
>;

// Schema para DTO de actualización (usa el schema base local y lo hace parcial)
export const updateModifierGroupSchema = modifierGroupBaseSchemaForForm.partial();
// Tipo inferido para DTO de actualización
export type UpdateModifierGroupInput = z.infer<
  typeof updateModifierGroupSchema
>;

// Schema para la respuesta de la API (extiende el schema de dominio)
export const modifierGroupApiSchema = domainModifierGroupSchema.extend({
  // Añadir campos que vienen de la API pero no están en el schema de dominio base
  id: z.string().uuid(), // Asegurar que ID esté aquí
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().nullable().optional(),
  // Definir schemas placeholder o importar los reales si existen
  productModifiers: z.array(z.any()).optional(), // Usar z.any() o un schema específico si existe
  products: z.array(z.any()).optional(), // Usar z.any() o un schema específico si existe
});

// Re-exportar el tipo de dominio centralizado
export type { ModifierGroup };

// Mantener exportaciones anteriores si otros archivos dependen de ellas (revisar si es necesario)
export const modifierGroupSchema = modifierGroupFormValidationSchema; // Alias para compatibilidad?
export const modifierGroupBaseSchema = modifierGroupBaseSchemaForForm; // Alias para compatibilidad?
