import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
  type QueryKey,
} from '@tanstack/react-query';
import * as subcategoriesService from '../services/subcategoriesService';
import {
  SubCategory,
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
  FindAllSubCategoriesDto,
} from '../types/subcategories.types';
import { PaginatedResponse } from '../../../app/types/api.types';
import { ApiError } from '../../../app/lib/errors';
import { useSnackbarStore, type SnackbarState } from '../../../app/store/snackbarStore';
import { getApiErrorMessage } from '../../../app/lib/errorMapping';

// Clave base para las queries de subcategorías
const SUBCATEGORIES_QUERY_KEY = 'subcategories';

// --- Query Hooks ---

/**
 * Hook para obtener una lista paginada y filtrada de subcategorías.
 */
export const useFindAllSubcategories = (
  params: FindAllSubCategoriesDto = {},
  enabled: boolean = true,
): UseQueryResult<PaginatedResponse<SubCategory>, ApiError> => {
  const queryKey: QueryKey = [SUBCATEGORIES_QUERY_KEY, 'list', params];
  return useQuery<PaginatedResponse<SubCategory>, ApiError, PaginatedResponse<SubCategory>, QueryKey>({
    queryKey: queryKey,
    queryFn: () => subcategoriesService.findAllSubcategories(params),
    enabled: enabled,
  });
};

/**
 * Hook para obtener una subcategoría específica por ID.
 */
export const useFindOneSubcategory = (
  id: string | undefined,
  enabled: boolean = true,
): UseQueryResult<SubCategory, ApiError> => {
  const queryKey: QueryKey = [SUBCATEGORIES_QUERY_KEY, 'detail', id];
  return useQuery<SubCategory, ApiError, SubCategory, QueryKey>({
    queryKey: queryKey,
    queryFn: () => subcategoriesService.findOneSubcategory(id!),
    enabled: enabled && !!id,
  });
};

// --- Mutation Hooks ---

type SubcategoryMutationContext = {
    previousSubcategories?: PaginatedResponse<SubCategory>;
    previousSubcategory?: SubCategory;
};


/**
 * Hook para crear una nueva subcategoría.
 */
export const useCreateSubcategory = (): UseMutationResult<
  SubCategory,
  ApiError,
  CreateSubCategoryDto,
  SubcategoryMutationContext
> => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state: SnackbarState) => state.showSnackbar);

  return useMutation<SubCategory, ApiError, CreateSubCategoryDto, SubcategoryMutationContext>({
    mutationFn: subcategoriesService.createSubcategory,
    onSuccess: (newSubcategory) => {
      // Invalidar queries de lista para asegurar que se muestre la nueva subcategoría
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_QUERY_KEY, 'list'] });


      showSnackbar({ message: 'Subcategoría creada con éxito', type: 'success' });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      showSnackbar({ message, type: 'error' });
    },
  });
};

/**
 * Hook para actualizar una subcategoría existente.
 */
export const useUpdateSubcategory = (): UseMutationResult<
  SubCategory,
  ApiError,
  { id: string; data: UpdateSubCategoryDto },
  SubcategoryMutationContext
> => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state: SnackbarState) => state.showSnackbar);

  return useMutation<SubCategory, ApiError, { id: string; data: UpdateSubCategoryDto }, SubcategoryMutationContext>({
    mutationFn: ({ id, data }) => subcategoriesService.updateSubcategory(id, data),
    onSuccess: (updatedSubcategory, variables) => {
      // Invalidar queries de lista y detalle para reflejar los cambios
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_QUERY_KEY, 'list'] });
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_QUERY_KEY, 'detail', variables.id] });


      showSnackbar({ message: 'Subcategoría actualizada con éxito', type: 'success' });
    },
    onError: (error, variables) => {
      const message = getApiErrorMessage(error);
      showSnackbar({ message, type: 'error' });


    },
  });
};

/**
 * Hook para eliminar (soft delete) una subcategoría.
 */
export const useRemoveSubcategory = (): UseMutationResult<
  void,
  ApiError,
  string, // ID
  SubcategoryMutationContext
> => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state: SnackbarState) => state.showSnackbar);

  return useMutation<void, ApiError, string, SubcategoryMutationContext>({
    mutationFn: subcategoriesService.removeSubcategory,
    onSuccess: (_, id) => {
      // Invalidar queries de lista y detalle para reflejar la eliminación
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_QUERY_KEY, 'list'] });
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_QUERY_KEY, 'detail', id] });


      showSnackbar({ message: 'Subcategoría eliminada con éxito', type: 'success' });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      showSnackbar({ message, type: 'error' });
    },
  });
};