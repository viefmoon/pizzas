import { z } from 'zod';

export const modifierSchema = z.object({
  groupId: z.string().uuid('El ID del grupo no es válido'),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(255).nullable().optional(),
  price: z.coerce.number().nullable().optional(), // Coerce string from API to number
  sortOrder: z.number().int().default(0),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const modifierApiSchema = modifierSchema.extend({
  id: z.string().uuid(),
});
export type Modifier = z.infer<typeof modifierApiSchema>;

export type ModifierFormInputs = {
  name: string;
  description?: string | null;
  price?: number | null;
  sortOrder?: number;
  isDefault?: boolean;
  isActive?: boolean;
};


export const modifierFormValidationSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(255).nullable().optional(),
  price: z.number().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});


export type CreateModifierInput = z.infer<typeof modifierSchema>;
export type UpdateModifierInput = Partial<Omit<CreateModifierInput, 'groupId'>>;