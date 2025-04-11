import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from '@tanstack/react-query';
import * as tableService from '../services/tableService';
import {
  Table,
  CreateTableDto,
  UpdateTableDto,
  FindAllTablesDto,
} from '../types/table.types';
import { BaseListQuery } from '../../../app/types/query.types';
import { useSnackbarStore } from '../../../app/store/snackbarStore';
import { getApiErrorMessage } from '../../../app/lib/errorMapping';

// --- Query Keys ---
const tablesQueryKeys = {
  all: ['tables'] as const,
  lists: () => [...tablesQueryKeys.all, 'list'] as const,
  list: (filters: FindAllTablesDto & BaseListQuery) =>
    [...tablesQueryKeys.lists(), filters] as const,
  listsByArea: (areaId: string) => [...tablesQueryKeys.lists(), { areaId }] as const,
  details: () => [...tablesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...tablesQueryKeys.details(), id] as const,
};

// --- Hooks ---

/**
 * Hook to fetch a paginated list of tables with filters.
 */
export const useGetTables = (
  filters: FindAllTablesDto = {},
  pagination: BaseListQuery = { page: 1, limit: 10 }
) => {
  const queryKey = tablesQueryKeys.list({ ...filters, ...pagination });
  return useQuery<Table[], Error>({
    queryKey,
    queryFn: () => tableService.getTables(filters, pagination),
  });
};

/**
 * Hook to fetch all tables belonging to a specific area.
 */
export const useGetTablesByAreaId = (areaId: string | null, options?: { enabled?: boolean }) => {
    const queryKey = tablesQueryKeys.listsByArea(areaId!);
    return useQuery<Table[], Error>({
        queryKey,
        queryFn: () => tableService.getTablesByAreaId(areaId!),
        enabled: !!areaId && (options?.enabled ?? true),
    });
};


/**
 * Hook to fetch a single table by its ID.
 */
export const useGetTableById = (id: string | null, options?: { enabled?: boolean }) => {
  const queryKey = tablesQueryKeys.detail(id!);
  return useQuery<Table, Error>({
    queryKey,
    queryFn: () => tableService.getTableById(id!),
    enabled: !!id && (options?.enabled ?? true),
  });
};

/**
 * Hook for creating a new table.
 */
export const useCreateTable = () => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<Table, Error, CreateTableDto>({
    mutationFn: tableService.createTable,
    onSuccess: (newTable) => {
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
      showSnackbar({ message: 'Mesa creada con éxito', type: 'success' });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error('Error creating table:', error);
    },
  });
};

/**
 * Hook for updating an existing table.
 */
export const useUpdateTable = () => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<Table, Error, { id: string; data: UpdateTableDto }>({
    mutationFn: ({ id, data }) => tableService.updateTable(id, data),
    onSuccess: (updatedTable) => {
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.detail(updatedTable.id) });
      showSnackbar({ message: 'Mesa actualizada con éxito', type: 'success' });
    },
    onError: (error, variables) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error(`Error updating table ${variables.id}:`, error);
    },
  });
};

/**
 * Hook for deleting a table.
 */
export const useDeleteTable = () => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<void, Error, string>({
    mutationFn: tableService.deleteTable,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: tablesQueryKeys.detail(deletedId) });
      showSnackbar({ message: 'Mesa eliminada con éxito', type: 'success' });
    },
    onError: (error, deletedId) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error(`Error deleting table ${deletedId}:`, error);
    },
  });
};