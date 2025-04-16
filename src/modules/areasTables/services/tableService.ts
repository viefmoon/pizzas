import { useQuery } from '@tanstack/react-query'; // Mantener una sola importación
import apiClient from '../../../app/services/apiClient';
import { ApiError } from '../../../app/lib/errors';
import { API_PATHS } from '../../../app/constants/apiPaths';
import { BackendErrorResponse } from '../../../app/types/api.types';
import { BaseListQuery } from '../../../app/types/query.types';
import {
  Table,
  CreateTableDto,
  UpdateTableDto,
  FindAllTablesDto,
} from '../types/table.types'; // Asegurarse que Table esté importado


export const getTables = async (
  filterOptions: FindAllTablesDto = {},
  paginationOptions: BaseListQuery = { page: 1, limit: 10 }
): Promise<Table[]> => {
  const response = await apiClient.get<Table[]>(API_PATHS.TABLES, {
    ...filterOptions,
    page: paginationOptions.page,
    limit: paginationOptions.limit,
  });

  if (!response.ok || !response.data) {
    console.error('[tableService.getTables] Failed to fetch tables:', response);
    throw ApiError.fromApiResponse(
      response.data as BackendErrorResponse | undefined,
      response.status
    );
  }
  return response.data;
};

export const getTablesByAreaId = async (areaId: string): Promise<Table[]> => {
    const response = await apiClient.get<Table[]>(`${API_PATHS.TABLES}/area/${areaId}`);

    if (!response.ok || !response.data) {
        console.error(`[tableService.getTablesByAreaId] Failed to fetch tables for area ${areaId}:`, response);
        throw ApiError.fromApiResponse(
            response.data as BackendErrorResponse | undefined,
            response.status
        );
    }
    return response.data;
};

export const getTableById = async (id: string): Promise<Table> => {
  const response = await apiClient.get<Table>(`${API_PATHS.TABLES}/${id}`);

  if (!response.ok || !response.data) {
    console.error(`[tableService.getTableById] Failed to fetch table ${id}:`, response);
    throw ApiError.fromApiResponse(
      response.data as BackendErrorResponse | undefined,
      response.status
    );
  }
  return response.data;
};

export const createTable = async (data: CreateTableDto): Promise<Table> => {
  const response = await apiClient.post<Table>(API_PATHS.TABLES, data);

  if (!response.ok || !response.data) {
     console.error('[tableService.createTable] Failed to create table:', response);
    throw ApiError.fromApiResponse(
      response.data as BackendErrorResponse | undefined,
      response.status
    );
  }
  return response.data;
};

export const updateTable = async (
  id: string,
  data: UpdateTableDto
): Promise<Table> => {
  const response = await apiClient.patch<Table>(`${API_PATHS.TABLES}/${id}`, data);

  if (!response.ok || !response.data) {
    console.error(`[tableService.updateTable] Failed to update table ${id}:`, response);
    throw ApiError.fromApiResponse(
      response.data as BackendErrorResponse | undefined,
      response.status
    );
  }
  return response.data;
};

export const deleteTable = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`${API_PATHS.TABLES}/${id}`);

  if (!response.ok) {
    console.error(`[tableService.deleteTable] Failed to delete table ${id}:`, response);
    throw ApiError.fromApiResponse(
      response.data as BackendErrorResponse | undefined,
      response.status
    );
  }
};

// --- React Query Hooks ---

// Claves de Query para tablas relacionadas con áreas
const tableQueryKeys = {
  base: ['tables'] as const, // Clave base para todas las tablas
  byArea: (areaId: string | null | undefined) => [...tableQueryKeys.base, 'area', areaId] as const,
};


/**
 * Hook para obtener la lista de mesas activas para un área específica usando React Query.
 * La query se habilita solo si se proporciona un areaId válido.
 * @param areaId - El ID del área seleccionada. La query se deshabilita si es null o undefined.
 */
export function useGetTablesByArea(areaId: string | null | undefined) {
  return useQuery<Table[], ApiError>({
    queryKey: tableQueryKeys.byArea(areaId),
    queryFn: () => {
      // Asegurarse de no llamar al servicio si areaId no es válido
      if (!areaId) {
        // Devolver una promesa resuelta con un array vacío para que useQuery no lance error
        return Promise.resolve([]);
      }
      return getTablesByAreaId(areaId); // Llama a la función getTablesByAreaId definida arriba
    },
    // Habilitar la query solo si areaId tiene un valor
    enabled: !!areaId,
    // Opciones adicionales (ej. mantener datos previos mientras carga)
    // keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutos (las mesas pueden cambiar más a menudo)
  });
}