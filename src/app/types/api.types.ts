import { z } from 'zod';

export interface BackendErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

// Esquema base para consultas de listas paginadas
export const baseListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  // Podríamos añadir 'search' o 'sortBy' aquí si son comunes
});

// Definir manualmente el tipo para asegurar que page y limit sean opcionales en TS
export type BaseListQueryDto = {
  page?: number;
  limit?: number;
  // Añadir otros campos base si existen y son necesarios en el tipo
};

// Interfaz genérica para respuestas paginadas de la API
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}