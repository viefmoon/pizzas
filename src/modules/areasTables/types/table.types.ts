import { z } from 'zod';
import { AreaSchema } from './area.types'; // Importar si se necesita anidar

// Esquema base para Table
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
  // Podríamos añadir el objeto Area si la API lo devuelve anidado
  // area: AreaSchema.optional(),
});

// Esquema para crear una Table
export const CreateTableSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  areaId: z.string().uuid('Debe seleccionar un área válida'),
  // Usar .preprocess para convertir string vacío o null a undefined antes de validar número
  capacity: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce.number().int().positive('La capacidad debe ser un número positivo').nullable().optional()
  ),
  isActive: z.boolean().optional().default(true),
  isAvailable: z.boolean().optional().default(true),
  isTemporary: z.boolean().optional().default(false),
  temporaryIdentifier: z.string().optional(),
});

// Esquema para actualizar una Table
export const UpdateTableSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  areaId: z.string().uuid('Debe seleccionar un área válida').optional(),
  capacity: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
     z.coerce.number().int().positive('La capacidad debe ser un número positivo').nullable().optional()
  ),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isTemporary: z.boolean().optional(),
  temporaryIdentifier: z.string().optional(),
});

// Tipos inferidos
export type Table = z.infer<typeof TableSchema>;
export type CreateTableDto = z.infer<typeof CreateTableSchema>;
export type UpdateTableDto = z.infer<typeof UpdateTableSchema>;

// Tipo para filtros (basado en FindAllTablesDto)
// Asegurarse que los booleanos se transformen correctamente desde query params (strings)
const transformBoolean = (val: unknown) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val; // Devolver el valor original si no es 'true' o 'false'
};

export const FindAllTablesSchema = z.object({
    name: z.string().optional(),
    areaId: z.string().uuid().optional(),
    capacity: z.coerce.number().int().optional(), // Coerce convierte string a número
    isActive: z.preprocess(transformBoolean, z.boolean().optional()),
    isAvailable: z.preprocess(transformBoolean, z.boolean().optional()),
    isTemporary: z.preprocess(transformBoolean, z.boolean().optional()),
});
export type FindAllTablesDto = z.infer<typeof FindAllTablesSchema>;