import apiClient from "../../../app/services/apiClient";
import { ApiError } from "../../../app/lib/errors";
import {
  SubCategory,
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
  FindAllSubCategoriesDto,
} from "../types/subcategories.types";
import { PaginatedResponse } from "../../../app/types/api.types";

const API_PATH = "/api/v1/subcategories";

/**
 * Crea una nueva subcategoría.
 */
export const createSubcategory = async (
  data: CreateSubCategoryDto
): Promise<SubCategory> => {
  const response = await apiClient.post<SubCategory>(API_PATH, data);
  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  return response.data;
};

/**
 * Obtiene todas las subcategorías con paginación y filtros.
 * Asume que el backend devuelve una tupla `[SubCategory[], number]` para la paginación.
 *
 *
 */
export const findAllSubcategories = async (
  params: FindAllSubCategoriesDto
): Promise<PaginatedResponse<SubCategory>> => {
  // Limpia los parámetros undefined antes de enviarlos a la API
  const queryParams = Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>
  );

  // Realiza la petición GET asumiendo una respuesta [data, total]
  const response = await apiClient.get<[SubCategory[], number]>(
    API_PATH,
    queryParams
  );

  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status);
  }

  // Transforma la respuesta de tupla a PaginatedResponse
  const [data, total] = response.data;
  return {
    data,
    total,
    page: params.page || 1,
    limit: params.limit || 10, // Usar el mismo default que se asume en el backend o el hook
    totalPages: Math.ceil(total / (params.limit || 10)),
  };
};

/**
 * Obtiene una subcategoría por su ID.
 */
export const findOneSubcategory = async (id: string): Promise<SubCategory> => {
  const response = await apiClient.get<SubCategory>(`${API_PATH}/${id}`);
  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  return response.data;
};

/**
 * Actualiza una subcategoría existente.
 */
export const updateSubcategory = async (
  id: string,
  data: UpdateSubCategoryDto
): Promise<SubCategory> => {
  const response = await apiClient.patch<SubCategory>(
    `${API_PATH}/${id}`,
    data
  );
  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  return response.data;
};

/**
 * Elimina (soft delete) una subcategoría por su ID.
 */
export const removeSubcategory = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`${API_PATH}/${id}`);
  // Manejo específico para DELETE:
  // - Si !response.ok y hay datos de error, lanzar ApiError.
  // - Si !response.ok, no hay datos, pero el status NO es 404, lanzar Error genérico.
  // - Si !response.ok y status es 404, se considera éxito (idempotencia).
  // - Si response.ok (implica status 200-299, usualmente 204 para DELETE), es éxito.
  if (!response.ok) {
    if (response.data) {
      // Hay un cuerpo de error definido por el backend
      throw ApiError.fromApiResponse(response.data, response.status);
    } else if (response.status !== 404) {
      // No hay cuerpo de error, pero no es un 404 esperado
      throw new Error(`Error deleting subcategory ${id}: Status ${response.status}`);
    }
    // Si es 404, no se lanza error.
  }
  // No se devuelve nada en caso de éxito (204) o 404.
};
