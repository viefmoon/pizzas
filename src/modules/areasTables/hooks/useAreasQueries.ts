import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from '@tanstack/react-query';
import * as areaService from '../services/areaService';
import {
  Area,
  CreateAreaDto,
  UpdateAreaDto,
  FindAllAreasDto,
} from '../types/area.types';
import { BaseListQuery } from '../../../app/types/query.types';
import { useSnackbarStore } from '../../../app/store/snackbarStore';
import { getApiErrorMessage } from '../../../app/lib/errorMapping';

// --- Query Keys ---
const areasQueryKeys = {
  all: ['areas'] as const,
  lists: () => [...areasQueryKeys.all, 'list'] as const,
  list: (filters: FindAllAreasDto & BaseListQuery) =>
    [...areasQueryKeys.lists(), filters] as const,
  details: () => [...areasQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...areasQueryKeys.details(), id] as const,
};

// --- Hooks ---

/**
 * Hook to fetch a paginated list of areas with filters.
 */
export const useGetAreas = (
  filters: FindAllAreasDto = {},
  pagination: BaseListQuery = { page: 1, limit: 10 }
) => {
  const queryKey = areasQueryKeys.list({ ...filters, ...pagination });
  return useQuery<Area[], Error>({
    queryKey,
    queryFn: () => areaService.getAreas(filters, pagination),
  });
};

/**
 * Hook to fetch a single area by its ID.
 */
export const useGetAreaById = (id: string | null, options?: { enabled?: boolean }) => {
  const queryKey = areasQueryKeys.detail(id!); // Use non-null assertion as it's enabled conditionally
  return useQuery<Area, Error>({
    queryKey,
    queryFn: () => areaService.getAreaById(id!),
    enabled: !!id && (options?.enabled ?? true),
  });
};

/**
 * Hook for creating a new area.
 */
export const useCreateArea = () => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<Area, Error, CreateAreaDto>({
    mutationFn: areaService.createArea,
    onSuccess: (newArea) => {
      queryClient.invalidateQueries({ queryKey: areasQueryKeys.lists() });
      showSnackbar({ message: 'Área creada con éxito', type: 'success' });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error('Error creating area:', error);
    },
  });
};

/**
 * Hook for updating an existing area.
 */
export const useUpdateArea = () => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<Area, Error, { id: string; data: UpdateAreaDto }>({
    mutationFn: ({ id, data }) => areaService.updateArea(id, data),
    onSuccess: (updatedArea) => {
      queryClient.invalidateQueries({ queryKey: areasQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: areasQueryKeys.detail(updatedArea.id) });
      showSnackbar({ message: 'Área actualizada con éxito', type: 'success' });
    },
    onError: (error, variables) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error(`Error updating area ${variables.id}:`, error);
    },
  });
};

/**
 * Hook for deleting an area.
 */
export const useDeleteArea = () => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<void, Error, string>({
    mutationFn: areaService.deleteArea,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: areasQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: areasQueryKeys.detail(deletedId) });
      showSnackbar({ message: 'Área eliminada con éxito', type: 'success' });
    },
    onError: (error, deletedId) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error(`Error deleting area ${deletedId}:`, error);
    },
  });
};