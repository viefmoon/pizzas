import apiClient from "../../../app/services/apiClient";
import { ApiError } from "../../../app/lib/errors";
import { API_PATHS } from "../../../app/constants/apiPaths";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  PaginatedResponse,
} from "../types/category.types";

/**
 * Obtiene una lista paginada de categorías, opcionalmente filtrada.
 * @param params - Parámetros de consulta opcionales (ej. isActive, page, limit).
 * @returns Una promesa que resuelve a una respuesta paginada de categorías.
 * @throws {ApiError} Si la respuesta de la API no es exitosa.
 */
export const getCategories = async (params?: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Category>> => {
  const response = await apiClient.get<[Category[], number]>(
    API_PATHS.CATEGORIES,
    params
  );

  if (
    !response.ok ||
    !response.data ||
    !Array.isArray(response.data) ||
    response.data.length !== 2
  ) {
    throw ApiError.fromApiResponse(response.data, response.status ?? 500);
  }

  const [categoriesData, totalCount] = response.data;
  const page = params?.page ?? 1;
  const limit =
    params?.limit ?? (categoriesData.length > 0 ? categoriesData.length : 10);

  const paginatedResponse: PaginatedResponse<Category> = {
    data: categoriesData,
    meta: {
      total: totalCount,
      page: page,
      limit: limit,
      totalPages:
        limit > 0 ? Math.ceil(totalCount / limit) : totalCount > 0 ? 1 : 0,
    },
  };

  return paginatedResponse;
};

/**
 * Obtiene los detalles de una categoría específica por su ID.
 * @param id - El ID de la categoría a obtener.
 * @returns Una promesa que resuelve a la categoría encontrada.
 * @throws {ApiError} Si la respuesta de la API no es exitosa (ej. 404 Not Found).
 */
export const getCategory = async (id: string): Promise<Category> => {
  const response = await apiClient.get<Category>(
    `${API_PATHS.CATEGORIES}/${id}`
  );

  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status ?? 500);
  }
  return response.data;
};

/**
 * Crea una nueva categoría.
 * @param data - Los datos para la nueva categoría (CreateCategoryDto).
 * @returns Una promesa que resuelve a la categoría recién creada.
 * @throws {ApiError} Si la respuesta de la API no es exitosa (ej. 400 Bad Request, 422 Unprocessable Entity).
 */
export const createCategory = async (
  data: CreateCategoryDto
): Promise<Category> => {
  const response = await apiClient.post<Category>(API_PATHS.CATEGORIES, data);

  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status ?? 500);
  }
  return response.data;
};

/**
 * Actualiza una categoría existente.
 * @param id - El ID de la categoría a actualizar.
 * @param data - Los datos a actualizar (UpdateCategoryDto).
 * @returns Una promesa que resuelve a la categoría actualizada.
 * @throws {ApiError} Si la respuesta de la API no es exitosa.
 */
export const updateCategory = async (
  id: string,
  data: UpdateCategoryDto
): Promise<Category> => {
  const response = await apiClient.patch<Category>(
    `${API_PATHS.CATEGORIES}/${id}`,
    data
  );

  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status ?? 500);
  }
  return response.data;
};

/**
 * Elimina una categoría existente.
 * @param id - El ID de la categoría a eliminar.
 * @returns Una promesa que resuelve cuando la eliminación es exitosa.
 * @throws {ApiError} Si la respuesta de la API no es exitosa.
 */
export const deleteCategory = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`${API_PATHS.CATEGORIES}/${id}`);

  if (!response.ok) {
    throw ApiError.fromApiResponse(response.data, response.status ?? 500);
  }
};

/**
 * Obtiene el menú completo desde el backend.
 * Incluye categorías, subcategorías, productos y modificadores activos.
 * @returns Una promesa que resuelve a un array de categorías con toda la estructura anidada (usando el tipo de 'orders').
 * @throws {ApiError} Si la respuesta de la API no es exitosa.
 */
export async function getFullMenu(): Promise<Category[]> {
  // Ya usa el tipo Category importado de orders
  // Usar la ruta definida en API_PATHS si existe, o la ruta directa
  const response = await apiClient.get<Category[]>(
    `${API_PATHS.CATEGORIES}/full-menu`
  ); // Esperamos que la API devuelva la estructura completa

  if (!response.ok || !response.data) {
    // Lanza un ApiError estructurado para que React Query lo capture
    throw ApiError.fromApiResponse(response.data, response.status ?? 500);
  }

  // Aquí también se podría añadir validación Zod si es necesario
  // y si el tipo Category importado es compatible con la respuesta.

  return response.data; // Devuelve los datos si la respuesta es exitosa
}

const categoryService = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getFullMenu, // Añadir la nueva función al objeto exportado
};

export default categoryService;
