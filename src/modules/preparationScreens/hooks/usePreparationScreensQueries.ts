import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { preparationScreensService } from '../services/preparationScreensService';
import {
  PreparationScreen,
  CreatePreparationScreenDto,
  UpdatePreparationScreenDto,
  FindAllPreparationScreensFilter,
} from '../types/preparationScreens.types';
import { BaseListQuery } from '../../../app/types/query.types';
import { useSnackbarStore } from '../../../app/store/snackbarStore';
import { getApiErrorMessage } from '../../../app/lib/errorMapping';
import { ApiError } from '../../../app/lib/errors';

// Constante para las query keys, siguiendo el patrón del proyecto
export const PREPARATION_SCREENS_QUERY_KEYS = {
  all: ['preparationScreens'] as const,
  lists: () => [...PREPARATION_SCREENS_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: FindAllPreparationScreensFilter, pagination?: BaseListQuery) =>
    [...PREPARATION_SCREENS_QUERY_KEYS.lists(), { filters: filters ?? {}, pagination: pagination ?? {} }] as const, // Ensure filters/pagination are objects
  details: () => [...PREPARATION_SCREENS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PREPARATION_SCREENS_QUERY_KEYS.details(), id] as const,
};

// Opciones comunes para los hooks de query
type PreparationScreenQueryOptions<TData = PreparationScreen[], TError = ApiError> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>;

// Opciones comunes para los hooks de mutación
type PreparationScreenMutationOptions<TData = PreparationScreen, TError = ApiError, TVariables = void> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  'mutationFn'
>;


/**
 * Hook para obtener todas las pantallas de preparación con filtros y paginación.
 */
export const useGetAllPreparationScreens = (
  filters?: FindAllPreparationScreensFilter,
  pagination?: BaseListQuery,
  options?: PreparationScreenQueryOptions
) => {
  const queryKey = PREPARATION_SCREENS_QUERY_KEYS.list(filters, pagination);
  return useQuery<PreparationScreen[], ApiError>({
    queryKey,
    queryFn: () => preparationScreensService.getAll(filters, pagination),
    ...options, // Spread other options like 'enabled', 'staleTime', etc.
  });
};

/**
 * Hook para obtener una pantalla de preparación específica por su ID.
 */
export const useGetPreparationScreenById = (
    id: string | null,
    options?: PreparationScreenQueryOptions<PreparationScreen> // Specify TData = PreparationScreen
) => {
  const queryKey = PREPARATION_SCREENS_QUERY_KEYS.detail(id ?? '');
  return useQuery<PreparationScreen, ApiError>({
    queryKey,
    queryFn: () => {
      if (!id) {
        // React Query manejará esto si enabled es false, pero podemos ser explícitos
        return Promise.reject(new Error('ID de pantalla de preparación no proporcionado.'));
      }
      return preparationScreensService.getById(id);
    },
    enabled: !!id && (options?.enabled ?? true), // Habilitar solo si hay ID y options.enabled no es false
    ...options,
  });
};

/**
 * Hook para crear una nueva pantalla de preparación.
 */
export const useCreatePreparationScreen = (
    options?: PreparationScreenMutationOptions<PreparationScreen, ApiError, CreatePreparationScreenDto>
) => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<PreparationScreen, ApiError, CreatePreparationScreenDto>({
    mutationFn: preparationScreensService.create,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: PREPARATION_SCREENS_QUERY_KEYS.lists() });
      showSnackbar({ message: `Pantalla "${data.name}" creada con éxito`, type: 'success' });
      options?.onSuccess?.(data, variables, context); // Call original onSuccess if provided
    },
    onError: (error, variables, context) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: `Error al crear: ${errorMessage}`, type: 'error' });
      console.error("Error creating preparation screen:", error);
      options?.onError?.(error, variables, context); // Call original onError if provided
    },
    ...options, // Spread other mutation options
  });
};

/**
 * Hook para actualizar una pantalla de preparación existente.
 */
export const useUpdatePreparationScreen = (
    options?: PreparationScreenMutationOptions<PreparationScreen, ApiError, { id: string; data: UpdatePreparationScreenDto }>
) => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<PreparationScreen, ApiError, { id: string; data: UpdatePreparationScreenDto }>({
    mutationFn: ({ id, data }) => preparationScreensService.update(id, data),
    onSuccess: (data, variables, context) => {
      // Invalidate list and the specific detail query
      queryClient.invalidateQueries({ queryKey: PREPARATION_SCREENS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PREPARATION_SCREENS_QUERY_KEYS.detail(variables.id) });
      // Optionally update cache directly for faster UI response
      // queryClient.setQueryData(PREPARATION_SCREENS_QUERY_KEYS.detail(variables.id), data);
      showSnackbar({ message: `Pantalla "${data.name}" actualizada con éxito`, type: 'success' });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: `Error al actualizar: ${errorMessage}`, type: 'error' });
      console.error(`Error updating preparation screen ${variables.id}:`, error);
      options?.onError?.(error, variables, context);
    },
     ...options,
  });
};

/**
 * Hook para eliminar una pantalla de preparación.
 */
export const useDeletePreparationScreen = (
    options?: PreparationScreenMutationOptions<void, ApiError, string> // TVariables is the ID (string)
) => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<void, ApiError, string>({
    mutationFn: preparationScreensService.delete, // Directly pass the service function
    onSuccess: (_, id, context) => { // First arg is void for delete
      queryClient.invalidateQueries({ queryKey: PREPARATION_SCREENS_QUERY_KEYS.lists() });
      // Remove the specific detail query from cache
      queryClient.removeQueries({ queryKey: PREPARATION_SCREENS_QUERY_KEYS.detail(id) });
      showSnackbar({ message: 'Pantalla de preparación eliminada con éxito', type: 'success' });
      options?.onSuccess?.(_, id, context);
    },
    onError: (error, id, context) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: `Error al eliminar: ${errorMessage}`, type: 'error' });
      console.error(`Error deleting preparation screen ${id}:`, error);
      options?.onError?.(error, id, context);
    },
    ...options,
  });
};