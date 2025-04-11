import apiClient from '../../../app/services/apiClient';
import { ApiError } from '../../../app/lib/errors';
import { BackendErrorResponse } from '../../../app/types/api.types';
import { BaseListQuery } from '../../../app/types/query.types';
import {
  Area,
  CreateAreaDto,
  UpdateAreaDto,
  FindAllAreasDto,
} from '../types/area.types';

const AREA_ENDPOINT = '/api/v1/areas';

export const getAreas = async (
  filterOptions: FindAllAreasDto = {},
  paginationOptions: BaseListQuery = { page: 1, limit: 10 }
): Promise<Area[]> => {
  const response = await apiClient.get<Area[]>(AREA_ENDPOINT, {
    ...filterOptions,
    page: paginationOptions.page,
    limit: paginationOptions.limit,
  });

  if (!response.ok || !response.data) {
    console.error('[areaService.getAreas] Failed to fetch areas:', response);
    throw ApiError.fromApiResponse(
      response.data as BackendErrorResponse | undefined,
      response.status
    );
  }
  return response.data;
};

export const getAreaById = async (id: string): Promise<Area> => {
  const response = await apiClient.get<Area>(`${AREA_ENDPOINT}/${id}`);

  if (!response.ok || !response.data) {
     console.error(`[areaService.getAreaById] Failed to fetch area ${id}:`, response);
    throw ApiError.fromApiResponse(
      response.data as BackendErrorResponse | undefined,
      response.status
    );
  }
  return response.data;
};

export const createArea = async (data: CreateAreaDto): Promise<Area> => {
  const response = await apiClient.post<Area>(AREA_ENDPOINT, data);

  if (!response.ok || !response.data) {
    console.error('[areaService.createArea] Failed to create area:', response);
    throw ApiError.fromApiResponse(
      response.data as BackendErrorResponse | undefined,
      response.status
    );
  }
  return response.data;
};

export const updateArea = async (
  id: string,
  data: UpdateAreaDto
): Promise<Area> => {
  const response = await apiClient.patch<Area>(`${AREA_ENDPOINT}/${id}`, data);

  if (!response.ok || !response.data) {
     console.error(`[areaService.updateArea] Failed to update area ${id}:`, response);
    throw ApiError.fromApiResponse(
      response.data as BackendErrorResponse | undefined,
      response.status
    );
  }
  return response.data;
};

export const deleteArea = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`${AREA_ENDPOINT}/${id}`);

  if (!response.ok) {
     console.error(`[areaService.deleteArea] Failed to delete area ${id}:`, response);
    throw ApiError.fromApiResponse(
      response.data as BackendErrorResponse | undefined,
      response.status
    );
  }
};