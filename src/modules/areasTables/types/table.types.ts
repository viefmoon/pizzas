import { z } from 'zod';

export const TableSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  areaId: z.string().uuid(),
  capacity: z.number().int().nullable().optional(),
  isActive: z.boolean(),
  isAvailable: z.boolean(),
  isTemporary: z.boolean(),
  temporaryIdentifier: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateTableSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  capacity: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce.number().int().positive('La capacidad debe ser un número positivo').nullable().optional()
  ),
  isActive: z.boolean().optional().default(true),
});

export const UpdateTableSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  capacity: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
     z.coerce.number().int().positive('La capacidad debe ser un número positivo').nullable().optional()
  ),
  isActive: z.boolean().optional(),
});

export type Table = z.infer<typeof TableSchema>;
export type CreateTableDto = z.infer<typeof CreateTableSchema>;
export type UpdateTableDto = z.infer<typeof UpdateTableSchema>;

const transformBoolean = (val: unknown) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
};

export const FindAllTablesSchema = z.object({
    name: z.string().optional(),
    areaId: z.string().uuid().optional(),
    capacity: z.coerce.number().int().optional(),
    isActive: z.preprocess(transformBoolean, z.boolean().optional()),
    isAvailable: z.preprocess(transformBoolean, z.boolean().optional()),
    isTemporary: z.preprocess(transformBoolean, z.boolean().optional()),
});
export type FindAllTablesDto = z.infer<typeof FindAllTablesSchema>;