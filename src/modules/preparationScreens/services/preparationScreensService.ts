import apiClient from '../../../app/services/apiClient';
import { ApiError } from '../../../app/lib/errors';
import {
  PreparationScreen,
  CreatePreparationScreenDto,
  UpdatePreparationScreenDto,
  FindAllPreparationScreensFilter,
  // preparationScreenSchema, // Uncomment if Zod validation is needed here
} from '../types/preparationScreens.types';
import { BaseListQuery } from '../../../app/types/query.types';

const BASE_PATH = '/preparation-screens';

/**
 * Fetches all preparation screens with optional filtering and pagination.
 */
const getAllPreparationScreens = async (
  filters?: FindAllPreparationScreensFilter,
  pagination?: BaseListQuery
): Promise<PreparationScreen[]> => {
  const params = {
    ...filters,
    ...(pagination && { page: pagination.page, limit: pagination.limit }),
  };
  // Ensure boolean filters are sent correctly if needed by backend (e.g., 'true'/'false' strings)
  if (params.isActive !== undefined) {
    params.isActive = String(params.isActive) as any; // Adjust if backend expects string
  }

  const response = await apiClient.get<PreparationScreen[]>(BASE_PATH, params);

  if (!response.ok || !response.data) {
    console.error('[getAllPreparationScreens] API Error:', response.problem, response.data);
    throw ApiError.fromApiResponse(response.data, response.status);
  }
  // Optionally validate response data with Zod here if needed
  // import { z } from 'zod';
  // const validation = z.array(preparationScreenSchema).safeParse(response.data);
  // if (!validation.success) {
  //   console.error('[getAllPreparationScreens] Zod Validation Error:', validation.error);
  //   throw new Error('Invalid data received from server.');
  // }
  return response.data; // return validation.data; if using Zod
};

/**
 * Fetches a single preparation screen by its ID.
 */
const getPreparationScreenById = async (id: string): Promise<PreparationScreen> => {
  const response = await apiClient.get<PreparationScreen>(`${BASE_PATH}/${id}`);

  if (!response.ok || !response.data) {
     console.error('[getPreparationScreenById] API Error:', response.problem, response.data);
    throw ApiError.fromApiResponse(response.data, response.status);
  }
   // Optionally validate response data with Zod here
   // const validation = preparationScreenSchema.safeParse(response.data);
   // if (!validation.success) { ... }
  return response.data; // return validation.data;
};

/**
 * Creates a new preparation screen.
 */
const createPreparationScreen = async (
  data: CreatePreparationScreenDto
): Promise<PreparationScreen> => {
  const response = await apiClient.post<PreparationScreen>(BASE_PATH, data);

  if (!response.ok || !response.data) {
     console.error('[createPreparationScreen] API Error:', response.problem, response.data);
    throw ApiError.fromApiResponse(response.data, response.status);
  }
   // Optionally validate response data with Zod here
  return response.data;
};

/**
 * Updates an existing preparation screen by its ID.
 */
const updatePreparationScreen = async (
  id: string,
  data: UpdatePreparationScreenDto
): Promise<PreparationScreen> => {
  // Ensure productIds is sent even if empty, if the backend expects it for clearing relations
  const payload = { ...data };
  if (data.productIds === undefined) {
     // If you want to ensure productIds is never sent unless explicitly provided:
     // delete payload.productIds;
     // If backend requires it to be explicitly null or empty array to clear:
     // payload.productIds = []; // or null, depending on backend API contract
  }

  const response = await apiClient.patch<PreparationScreen>(`${BASE_PATH}/${id}`, payload);

  if (!response.ok || !response.data) {
     console.error('[updatePreparationScreen] API Error:', response.problem, response.data);
    throw ApiError.fromApiResponse(response.data, response.status);
  }
   // Optionally validate response data with Zod here
  return response.data;
};

/**
 * Deletes a preparation screen by its ID.
 */
const deletePreparationScreen = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`${BASE_PATH}/${id}`);

  // Status 204 No Content is a success for DELETE
  if (!response.ok && response.status !== 204) {
     console.error('[deletePreparationScreen] API Error:', response.problem, response.data);
    // For DELETE, we might not always get data back on error, handle appropriately
    throw ApiError.fromApiResponse(response.data ?? { message: 'Failed to delete preparation screen' }, response.status);
  }
  // No data expected on successful delete (204 No Content)
};

export const preparationScreensService = {
  getAll: getAllPreparationScreens,
  getById: getPreparationScreenById,
  create: createPreparationScreen,
  update: updatePreparationScreen,
  delete: deletePreparationScreen,
};