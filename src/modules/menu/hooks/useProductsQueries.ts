import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { productsService } from '../services/productsService';
import {
  Product,
  ProductFormInputs,
  FindAllProductsQuery,
  ProductsListResponse,
  AssignModifierGroupsInput,
} from '../types/products.types';
import { ApiError } from '@/app/lib/errors';
import { useSnackbarStore } from '@/app/store/snackbarStore'; // Importar store de Snackbar
import { getApiErrorMessage } from '@/app/lib/errorMapping'; // Importar mapeo de errores

const productKeys = {
  all: ['products'] as const,
  lists: (filters: FindAllProductsQuery) => [...productKeys.all, 'list', filters] as const,
  details: (id: string) => [...productKeys.all, 'detail', id] as const,
  detailModifierGroups: (id: string) => [...productKeys.details(id), 'modifier-groups'] as const,
};

/**
 * Hook para obtener la lista de productos con filtros y paginación.
 * @param filters - Filtros y paginación (FindAllProductsQuery).
 * @param options - Opciones adicionales para useQuery.
 */
export function useProductsQuery(
  filters: FindAllProductsQuery,
  options?: { enabled?: boolean }
): UseQueryResult<ProductsListResponse, ApiError> {
  return useQuery<ProductsListResponse, ApiError>({
    queryKey: productKeys.lists(filters),
    queryFn: () => productsService.findAll(filters),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook para obtener los detalles de un producto por ID.
 * @param productId - ID del producto.
 * @param options - Opciones adicionales para useQuery.
 */
export function useProductQuery(
  productId: string,
  options?: { enabled?: boolean }
): UseQueryResult<Product, ApiError> {
  return useQuery<Product, ApiError>({
    queryKey: productKeys.details(productId),
    queryFn: () => productsService.findOne(productId),
    enabled: !!productId && (options?.enabled ?? true),
  });
}

/**
 * Hook para crear un nuevo producto.
 */
export function useCreateProductMutation(): UseMutationResult<Product, ApiError, ProductFormInputs> {
  const queryClient = useQueryClient();
  return useMutation<Product, ApiError, ProductFormInputs>({
    mutationFn: (newProduct) => productsService.create(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/**
 * Hook para actualizar un producto existente.
 */
export function useUpdateProductMutation(): UseMutationResult<Product, ApiError, { id: string; data: Partial<ProductFormInputs> }, { previousProducts?: ProductsListResponse; previousDetail?: Product }> {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  type UpdateProductContext = { previousDetail?: Product };

  return useMutation<Product, ApiError, { id: string; data: Partial<ProductFormInputs> }, UpdateProductContext>({
    mutationFn: ({ id, data }) => productsService.update(id, data),

    onMutate: async (variables) => {
      const { id, data } = variables;
      const detailQueryKey = productKeys.details(id);

      await queryClient.cancelQueries({ queryKey: detailQueryKey });

      const previousDetail = queryClient.getQueryData<Product>(detailQueryKey);

      if (previousDetail) {
        queryClient.setQueryData<Product>(detailQueryKey, (old) => {
          if (!old) return undefined;
          const { variants, modifierGroupIds, ...restOfData } = data;
          return { ...old, ...restOfData };
        });
      }

      return { previousDetail };
    },

    onError: (error, variables, context) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error(`Error updating product ${variables.id}:`, error);

      if (context?.previousDetail) {
        queryClient.setQueryData(productKeys.details(variables.id), context.previousDetail);
      }
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });

      if (!error && data) {
        showSnackbar({ message: 'Producto actualizado con éxito', type: 'success' });
      }
    },
  });
}

/**
 * Hook para eliminar (soft delete) un producto.
 */
export function useDeleteProductMutation(): UseMutationResult<void, ApiError, string, { previousDetail?: Product }> {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar); // Añadir Snackbar

  type DeleteProductContext = { previousDetail?: Product };

  return useMutation<void, ApiError, string, DeleteProductContext>({
    mutationFn: (productId) => productsService.remove(productId),

    onMutate: async (deletedId) => {
        const detailQueryKey = productKeys.details(deletedId);

        await queryClient.cancelQueries({ queryKey: detailQueryKey });

        const previousDetail = queryClient.getQueryData<Product>(detailQueryKey);

        queryClient.removeQueries({ queryKey: detailQueryKey });

        return { previousDetail };
    },

    onError: (error, deletedId, context) => {
      const errorMessage = getApiErrorMessage(error);
      showSnackbar({ message: errorMessage, type: 'error' });
      console.error(`Error deleting product ${deletedId}:`, error);

      if (context?.previousDetail) {
        queryClient.setQueryData(productKeys.details(deletedId), context.previousDetail);
      }
    },

    onSettled: (data, error, deletedId) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });

      if (!error) {
          queryClient.removeQueries({ queryKey: productKeys.details(deletedId) });
          showSnackbar({ message: 'Producto eliminado con éxito', type: 'success' });
      }
    },
  });
}

/**
 * Hook para asignar grupos de modificadores a un producto.
 */
export function useAssignModifierGroupsMutation(): UseMutationResult<Product, ApiError, { productId: string; data: AssignModifierGroupsInput }> {
    const queryClient = useQueryClient();
    return useMutation<Product, ApiError, { productId: string; data: AssignModifierGroupsInput }>({
        mutationFn: ({ productId, data }) => productsService.assignModifierGroups(productId, data),
        onSuccess: (updatedProduct) => {
            queryClient.invalidateQueries({ queryKey: productKeys.details(updatedProduct.id) });
            queryClient.invalidateQueries({ queryKey: productKeys.detailModifierGroups(updatedProduct.id) });
        },
    });
}

/**
 * Hook para obtener los grupos de modificadores de un producto.
 * Podría integrarse en useProductQuery si el endpoint findOne ya los devuelve,
 * o usar un endpoint/queryKey específico si es necesario.
 * Este es un ejemplo si hubiera un endpoint dedicado o se quisiera separar la lógica.
 */
export function useProductModifierGroupsQuery(
    productId: string,
    options?: { enabled?: boolean }
): UseQueryResult<Product, ApiError> {
    return useQuery<Product, ApiError>({
        queryKey: productKeys.detailModifierGroups(productId),
        queryFn: () => productsService.getModifierGroups(productId),
        enabled: !!productId && (options?.enabled ?? true),
    });
}


/**
 * Hook para eliminar grupos de modificadores de un producto.
 */
export function useRemoveModifierGroupsMutation(): UseMutationResult<Product, ApiError, { productId: string; data: AssignModifierGroupsInput }> {
    const queryClient = useQueryClient();
    return useMutation<Product, ApiError, { productId: string; data: AssignModifierGroupsInput }>({
        mutationFn: ({ productId, data }) => productsService.removeModifierGroups(productId, data),
        onSuccess: (updatedProduct) => {
            queryClient.invalidateQueries({ queryKey: productKeys.details(updatedProduct.id) });
            queryClient.invalidateQueries({ queryKey: productKeys.detailModifierGroups(updatedProduct.id) });
        },
    });
}