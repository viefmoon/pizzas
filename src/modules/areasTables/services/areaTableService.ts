import apiClient from '@/app/services/apiClient';
import { ApiError } from '@/app/lib/errors';
import { API_PATHS } from '@/app/constants/apiPaths'; // Asumiendo que defines rutas aquí
import type { Area, Table } from '../types/areasTables.types';

/**
 * Obtiene una lista de todas las áreas activas.
 * @returns Una promesa que resuelve a un array de áreas.
 * @throws {ApiError} Si la respuesta de la API no es exitosa.
 */
export const getAreas = async (): Promise<Area[]> => {
  // Asumiendo un endpoint GET /areas que devuelve las áreas activas
  const response = await apiClient.get<Area[]>(API_PATHS.AREAS); // Necesitarás definir API_PATHS.AREAS

  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status ?? 500);
  }
  return response.data;
};

/**
 * Obtiene una lista de las mesas activas para un área específica.
 * @param areaId - El ID del área cuyas mesas se quieren obtener.
 * @returns Una promesa que resuelve a un array de mesas.
 * @throws {ApiError} Si la respuesta de la API no es exitosa.
 */
export const getTablesByArea = async (areaId: string): Promise<Table[]> => {
  if (!areaId) {
    // Evitar llamada a API si no hay areaId
    return Promise.resolve([]);
  }
  // Asumiendo un endpoint GET /areas/{areaId}/tables
  const response = await apiClient.get<Table[]>(`${API_PATHS.AREAS}/${areaId}/tables`); // Ajusta la ruta según tu API

  if (!response.ok || !response.data) {
    throw ApiError.fromApiResponse(response.data, response.status ?? 500);
  }
  return response.data;
};

const areaTableService = {
  getAreas,
  getTablesByArea,
};

export default areaTableService;