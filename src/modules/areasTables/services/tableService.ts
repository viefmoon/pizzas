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
} from '../types/table.types';


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