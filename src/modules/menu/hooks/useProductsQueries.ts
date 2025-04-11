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
export function useUpdateProductMutation(): UseMutationResult<Product, ApiError, { id: string; data: Partial<ProductFormInputs> }> {
  const queryClient = useQueryClient();
  return useMutation<Product, ApiError, { id: string; data: Partial<ProductFormInputs> }>({
    mutationFn: ({ id, data }) => productsService.update(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/**
 * Hook para eliminar (soft delete) un producto.
 */
export function useDeleteProductMutation(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (productId) => productsService.remove(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      // Opcionalmente, remover de la caché de detalles si existe
      queryClient.removeQueries({ queryKey: productKeys.details(productId) });
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