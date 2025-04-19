/**
 * Representa la estructura de una foto asociada a una categoría.
 */
export interface CategoryPhoto {
  id: string;
  path: string;
}

/**
 * Representa una categoría del menú.
 */
export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  photo: CategoryPhoto | null;
}

/**
 * Estructura genérica para respuestas paginadas de la API.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type ActiveFilter = "all" | "active" | "inactive";

// Zod schemas (categoryPhotoSchema, categorySchema, CreateCategoryDto, etc.)
// are defined in ../schema/category.schema.ts
