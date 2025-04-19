import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
  type UseMutationResult,
  type QueryKey,
} from '@tanstack/react-query';
import { modifierGroupService } from "../services/modifierGroupService";
import {
  ModifierGroup,
  CreateModifierGroupInput,
  UpdateModifierGroupInput,
} from "../types/modifierGroup.types";
import { ApiError } from '@/app/lib/errors'; // Asegurar importación de ApiError
import { useSnackbarStore, type SnackbarState } from '@/app/store/snackbarStore'; // Importar Snackbar
import { getApiErrorMessage } from '@/app/lib/errorMapping'; // Importar mapeo de errores

// --- Query Keys ---
const modifierGroupKeys = {
  all: ['modifierGroups'] as const,
  lists: () => [...modifierGroupKeys.all, 'list'] as const,
  list: (filters: FindAllModifierGroupsQuery) => [...modifierGroupKeys.lists(), filters] as const,
  details: () => [...modifierGroupKeys.all, 'detail'] as const,
  detail: (id: string) => [...modifierGroupKeys.details(), id] as const,
};


// Definir tipo para los filtros basado en el servicio
interface FindAllModifierGroupsQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

/**
 * Hook para obtener la lista de grupos de modificadores.
 * Nota: El servicio findAll devuelve ModifierGroup[], no una respuesta paginada.
 * Ajustar si el backend cambia.
 */
export const useModifierGroupsQuery = (
  filters: FindAllModifierGroupsQuery = {},
  options?: Omit<
    UseQueryOptions<ModifierGroup[], ApiError>, // Usar ApiError
    "queryKey" | "queryFn"
  >
): UseQueryResult<ModifierGroup[], ApiError> => { // Especificar tipo de retorno
  const queryKey = modifierGroupKeys.list(filters);
  return useQuery<ModifierGroup[], ApiError>({
    queryKey: queryKey,
    queryFn: () => modifierGroupService.findAll(filters),
    ...options,
  });
};

/**
 * Hook para obtener un grupo de modificadores por ID.
 */
export const useModifierGroupQuery = (
    id: string | undefined,
    options?: Omit<UseQueryOptions<ModifierGroup, ApiError>, 'queryKey' | 'queryFn'>
): UseQueryResult<ModifierGroup, ApiError> => {
    const queryKey = modifierGroupKeys.detail(id!);
    return useQuery<ModifierGroup, ApiError>({
        queryKey: queryKey,
        queryFn: () => modifierGroupService.findOne(id!),
        enabled: !!id && (options?.enabled ?? true),
        ...options,
    });
};


type UpdateModifierGroupContext = {
    previousDetail?: ModifierGroup;
};

/**
 * Hook para crear un nuevo grupo de modificadores.
 */
export const useCreateModifierGroupMutation = (): UseMutationResult<
  ModifierGroup,
  ApiError,
  CreateModifierGroupInput
> => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state: SnackbarState) => state.showSnackbar);

  return useMutation<ModifierGroup, ApiError, CreateModifierGroupInput>({
    mutationFn: modifierGroupService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modifierGroupKeys.lists() });
      showSnackbar({ message: 'Grupo de modificadores creado con éxito', type: 'success' });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      showSnackbar({ message, type: 'error' });
      console.error('Error creating modifier group:', error);
    },
  });
};

/**
 * Hook para actualizar un grupo de modificadores existente (con actualización optimista).
 */
export const useUpdateModifierGroupMutation = (): UseMutationResult<
  ModifierGroup,
  ApiError,
  { id: string; data: UpdateModifierGroupInput },
  UpdateModifierGroupContext
> => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state: SnackbarState) => state.showSnackbar);

  return useMutation<ModifierGroup, ApiError, { id: string; data: UpdateModifierGroupInput }, UpdateModifierGroupContext>({
    mutationFn: ({ id, data }) => modifierGroupService.update(id, data),

    onMutate: async (variables) => {
      const { id, data } = variables;
      const detailQueryKey = modifierGroupKeys.detail(id);

      await queryClient.cancelQueries({ queryKey: detailQueryKey });
      const previousDetail = queryClient.getQueryData<ModifierGroup>(detailQueryKey);

      if (previousDetail) {
        queryClient.setQueryData<ModifierGroup>(detailQueryKey, (old) =>
          old ? { ...old, ...data } : undefined
        );
      }
      return { previousDetail };
    },

    onError: (error, variables, context) => {
      const message = getApiErrorMessage(error);
      showSnackbar({ message, type: 'error' });
      console.error(`Error updating modifier group ${variables.id}:`, error);
      if (context?.previousDetail) {
        queryClient.setQueryData(modifierGroupKeys.detail(variables.id), context.previousDetail);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: modifierGroupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: modifierGroupKeys.detail(variables.id) });
      if (!error && data) {
        showSnackbar({ message: 'Grupo de modificadores actualizado con éxito', type: 'success' });
      }
    },
  });
};

/**
 * Hook para eliminar un grupo de modificadores.
 */
export const useDeleteModifierGroupMutation = (): UseMutationResult<
  void,
  ApiError,
  string, // ID
  { previousDetail?: ModifierGroup } // Añadir contexto
> => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state: SnackbarState) => state.showSnackbar);

  type DeleteModifierGroupContext = { previousDetail?: ModifierGroup };

  return useMutation<void, ApiError, string, DeleteModifierGroupContext>({
    mutationFn: modifierGroupService.remove,

    onMutate: async (deletedId) => {
        const detailQueryKey = modifierGroupKeys.detail(deletedId);

        await queryClient.cancelQueries({ queryKey: detailQueryKey });

        const previousDetail = queryClient.getQueryData<ModifierGroup>(detailQueryKey);

        queryClient.removeQueries({ queryKey: detailQueryKey });

        return { previousDetail };
    },

    onError: (error, deletedId, context) => {
      const message = getApiErrorMessage(error);
      showSnackbar({ message, type: 'error' });
      console.error(`Error deleting modifier group ${deletedId}:`, error);

      if (context?.previousDetail) {
        queryClient.setQueryData(modifierGroupKeys.detail(deletedId), context.previousDetail);
      }
    },

    onSettled: (data, error, deletedId) => {
      queryClient.invalidateQueries({ queryKey: modifierGroupKeys.lists() });

      if (!error) {
          queryClient.removeQueries({ queryKey: modifierGroupKeys.detail(deletedId) });
          showSnackbar({ message: 'Grupo de modificadores eliminado con éxito', type: 'success' });
      }
    },
  });
};