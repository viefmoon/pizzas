import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from '@tanstack/react-query';
import * as preparationScreenService from '../services/preparationScreenService';
import {
  PreparationScreen,
  CreatePreparationScreenDto,
  UpdatePreparationScreenDto,
  FindAllPreparationScreensDto,
} from '../types/preparationScreen.types';
import { BaseListQuery } from '../../../app/types/query.types';
import { useSnackbarStore } from '../../../app/store/snackbarStore';
import { getApiErrorMessage } from '../../../app/lib/errorMapping';

// --- Query Keys ---
const preparationScreensQueryKeys = {
  all: ['preparationScreens'] as const,
  lists: () => [...preparationScreensQueryKeys.all, 'list'] as const,
  list: (filters: FindAllPreparationScreensDto & BaseListQuery) =>
    [...preparationScreensQueryKeys.lists(), filters] as const,
  details: () => [...preparationScreensQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...preparationScreensQueryKeys.details(), id] as const,
};

// --- Hooks ---

/**
 * Hook to fetch a paginated list of preparation screens with filters.
 */
export const useGetPreparationScreens = (
  filters: FindAllPreparationScreensDto = {},
  pagination: BaseListQuery = { page: 1, limit: 15 } // Default limit 15
) => {
  const queryKey = preparationScreensQueryKeys.list({ ...filters, ...pagination });
  // El servicio getPreparationScreens ya maneja la estructura [data, count] y devuelve data[]
  return useQuery<PreparationScreen[], Error>({
    queryKey,
    queryFn: () => preparationScreenService.getPreparationScreens(filters, pagination),
    // Considerar placeholderData o initialData si es necesario para UX
  });
};

/**
 * Hook to fetch a single preparation screen by its ID.
 */
export const useGetPreparationScreenById = (id: string | null, options?: { enabled?: boolean }) => {
  const queryKey = preparationScreensQueryKeys.detail(id!); // Use non-null assertion as it's enabled conditionally
  return useQuery<PreparationScreen, Error>({
    queryKey,
    queryFn: () => preparationScreenService.getPreparationScreenById(id!),
    enabled: !!id && (options?.enabled ?? true), // Only run query if id is provided and enabled
  });
};

/**
 * Hook for creating a new preparation screen.
 */
export const useCreatePreparationScreen = () => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<PreparationScreen, Error, CreatePreparationScreenDto>({
    mutationFn: preparationScreenService.createPreparationScreen,
    onSuccess: (newScreen) => {
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: preparationScreensQueryKeys.lists() });
      showSnackbar({ message: 'Pantalla de preparación creada con éxito', type: 'success' });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error('Error creating preparation screen:', error);
    },
  });
};

/**
 * Hook for updating an existing preparation screen.
 */
export const useUpdatePreparationScreen = () => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<PreparationScreen, Error, { id: string; data: UpdatePreparationScreenDto }>({
    mutationFn: ({ id, data }) => preparationScreenService.updatePreparationScreen(id, data),
    onSuccess: (updatedScreen) => {
      // Invalidate list and detail queries
      queryClient.invalidateQueries({ queryKey: preparationScreensQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: preparationScreensQueryKeys.detail(updatedScreen.id) });
      // Opcionalmente, actualizar la caché directamente con setQueryData
      // queryClient.setQueryData(preparationScreensQueryKeys.detail(updatedScreen.id), updatedScreen);
      showSnackbar({ message: 'Pantalla de preparación actualizada con éxito', type: 'success' });
    },
    onError: (error, variables) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error(`Error updating preparation screen ${variables.id}:`, error);
    },
  });
};

/**
 * Hook for deleting a preparation screen.
 */
export const useDeletePreparationScreen = () => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<void, Error, string>({
    mutationFn: preparationScreenService.deletePreparationScreen,
    onSuccess: (_, deletedId) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: preparationScreensQueryKeys.lists() });
      // Remove detail query from cache
      queryClient.removeQueries({ queryKey: preparationScreensQueryKeys.detail(deletedId) });
      showSnackbar({ message: 'Pantalla de preparación eliminada con éxito', type: 'success' });
    },
    onError: (error, deletedId) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error(`Error deleting preparation screen ${deletedId}:`, error);
    },
  });
};