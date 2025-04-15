import apiClient from "@/app/services/apiClient";
import { ApiError } from "@/app/lib/errors";
import { API_PATHS } from "@/app/constants/apiPaths";
import {
  Product,
  ProductFormInputs,
  FindAllProductsQuery,
  ProductsListResponse,
  AssignModifierGroupsInput,
} from "../types/products.types";


/**
 * Obtiene todos los productos con filtros y paginación.
 * @param params - Parámetros de consulta (FindAllProductsQuery).
 * @returns Una promesa que resuelve a ProductsListResponse.
 * @throws {ApiError} Si la petición falla.
 */
async function findAll(
  params: FindAllProductsQuery
): Promise<ProductsListResponse> {
  const response = await apiClient.get<ProductsListResponse>(
    API_PATHS.PRODUCTS,
    params
  );
  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  return response.data;
}

/**
 * Obtiene un producto por su ID.
 * @param id - ID del producto.
 * @returns Una promesa que resuelve al Product encontrado.
 * @throws {ApiError} Si la petición falla o el producto no se encuentra.
 */
async function findOne(id: string): Promise<Product> {
  const response = await apiClient.get<Product>(`${API_PATHS.PRODUCTS}/${id}`);
  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  return response.data;
}

/**
 * Crea un nuevo producto.
 * @param data - Datos del producto (ProductFormInputs).
 * @returns Una promesa que resuelve al Product creado.
 * @throws {ApiError} Si la petición falla.
 */
async function create(data: ProductFormInputs): Promise<Product> {
  const response = await apiClient.post<Product>(API_PATHS.PRODUCTS, data);
  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  return response.data;
}

/**
 * Actualiza un producto existente.
 * @param id - ID del producto a actualizar.
 * @param data - Datos a actualizar (Partial<ProductFormInputs>).
 * @returns Una promesa que resuelve al Product actualizado.
 * @throws {ApiError} Si la petición falla.
 */
async function update(
  id: string,
  data: Partial<ProductFormInputs>
): Promise<Product> {
  const response = await apiClient.patch<Product>(
    `${API_PATHS.PRODUCTS}/${id}`,
    data
  );
  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  return response.data;
}

/**
 * Elimina (soft delete) un producto.
 * @param id - ID del producto a eliminar.
 * @returns Una promesa que resuelve cuando la operación es exitosa.
 * @throws {ApiError} Si la petición falla.
 */
async function remove(id: string): Promise<void> {
  const response = await apiClient.delete(`${API_PATHS.PRODUCTS}/${id}`);
  if (!response.ok) {
    // No esperamos 'data' en un 204 No Content, pero sí puede haber error
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  // No se retorna nada en caso de éxito (204 No Content)
}

/**
 * Asigna grupos de modificadores a un producto.
 * @param productId - ID del producto.
 * @param data - Datos con los IDs de los grupos (AssignModifierGroupsInput).
 * @returns Una promesa que resuelve al Product actualizado con los grupos.
 * @throws {ApiError} Si la petición falla.
 */
async function assignModifierGroups(
  productId: string,
  data: AssignModifierGroupsInput
): Promise<Product> {
  const response = await apiClient.post<Product>(
    `${API_PATHS.PRODUCTS}/${productId}/modifier-groups`,
    data
  );
  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  return response.data;
}

/**
 * Obtiene los grupos de modificadores asignados a un producto.
 * @param productId - ID del producto.
 * @returns Una promesa que resuelve al Product con sus grupos de modificadores.
 * @throws {ApiError} Si la petición falla.
 */
async function getModifierGroups(productId: string): Promise<Product> {
  // Nota: El backend devuelve el producto completo con los grupos anidados.
  // Si hubiera un endpoint específico que solo devuelve los grupos, se ajustaría.
  const response = await apiClient.get<Product>(
    `${API_PATHS.PRODUCTS}/${productId}/modifier-groups`
  );
  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  return response.data;
}

/**
 * Elimina grupos de modificadores de un producto.
 * @param productId - ID del producto.
 * @param data - Datos con los IDs de los grupos a eliminar (AssignModifierGroupsInput).
 * @returns Una promesa que resuelve al Product actualizado.
 * @throws {ApiError} Si la petición falla.
 */
async function removeModifierGroups(
  productId: string,
  data: AssignModifierGroupsInput
): Promise<Product> {
  // El backend usa DELETE pero espera un body, lo cual es atípico pero posible.
  // Apisauce maneja esto correctamente.
  const response = await apiClient.delete<Product>(
    `${API_PATHS.PRODUCTS}/${productId}/modifier-groups`,
    data
  );
  if (!response.ok || !response.data) {
    // Asumimos que devuelve el producto actualizado tras eliminar, ajustar si no es así.
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  return response.data;
}

export const productsService = {
  findAll,
  findOne,
  create,
  update,
  remove,
  assignModifierGroups,
  getModifierGroups,
  removeModifierGroups,
};
