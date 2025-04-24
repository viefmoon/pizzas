// Importar tipos de dominio centralizados
import type { Area } from '../../../app/types/domain/area.types';
import type { Table } from '../../../app/types/domain/table.types';

// Re-exportar tipos de dominio para uso dentro del módulo
export type { Area, Table };

// Los DTOs y tipos de formulario (CreateAreaDto, UpdateAreaDto, CreateTableDto, UpdateTableDto, etc.)
// se definen y exportan desde los archivos de schema correspondientes:
// - ../schema/area.schema.ts
// - ../schema/table.schema.ts