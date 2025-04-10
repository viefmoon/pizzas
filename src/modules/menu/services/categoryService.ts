import apiClient from "../../../app/services/apiClient"; // Ajusta la ruta según tu estructura
import { ApiError } from "../../../app/lib/errors"; // Ajusta la ruta
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  PaginatedResponse,
} from "../types/category.types";

// Asume que la API tiene endpoints como /categories
const BASE_URL = "/api/v1/categories";

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
  // La API devuelve [Category[], number] en lugar de PaginatedResponse
  const response = await apiClient.get<[Category[], number]>(BASE_URL, params);

  if (
    !response.ok ||
    !response.data ||
    !Array.isArray(response.data) ||
    response.data.length !== 2
  ) {
    // Si la respuesta no es ok, o no tiene datos, o no es un array de 2 elementos
    // El mensaje se generará a partir de response.data o será genérico
    throw ApiError.fromApiResponse(response.data, response.status ?? 500);
  }

  // Transformar la respuesta [Category[], number] a PaginatedResponse<Category>
  const [categoriesData, totalCount] = response.data;
  const page = params?.page ?? 1;
  // Si no hay límite en params, usar la longitud de los datos recibidos o un default (ej. 10)
  const limit = params?.limit ?? (categoriesData.length > 0 ? categoriesData.length : 10);

  const paginatedResponse: PaginatedResponse<Category> = {
    data: categoriesData,
    meta: {
      total: totalCount,
      page: page,
      limit: limit,
      // Calcular totalPages correctamente, asegurando que no sea 0 si totalCount es 0
      totalPages: limit > 0 ? Math.ceil(totalCount / limit) : (totalCount > 0 ? 1 : 0),
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
  const response = await apiClient.get<Category>(`${BASE_URL}/${id}`);

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
  const response = await apiClient.post<Category>(BASE_URL, data);

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
  // Usamos PATCH para actualizaciones parciales, ajusta a PUT si tu API lo requiere
  const response = await apiClient.patch<Category>(`${BASE_URL}/${id}`, data);

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
  const response = await apiClient.delete(`${BASE_URL}/${id}`);

  // Para DELETE, a menudo no hay cuerpo de respuesta en éxito (204 No Content)
  // Solo verificamos si la respuesta fue 'ok' (status 2xx)
  if (!response.ok) {
    throw ApiError.fromApiResponse(response.data, response.status ?? 500);
  }
  // No se devuelve nada en caso de éxito (void)
};

// Exportar un objeto con todos los métodos también es una opción común
const categoryService = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
