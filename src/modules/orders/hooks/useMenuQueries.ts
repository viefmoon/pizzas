import { useQuery } from '@tanstack/react-query';
// Importar desde el servicio de categorías correcto
import { getFullMenu } from '@/modules/menu/services/categoryService';
// Importar el tipo Category que SÍ representa el menú completo (definido en orders)
import type { Category } from '@/modules/orders/types/orders.types';
import { ApiError } from '@/app/lib/errors';

// Define una clave única para esta query
const queryKey = ['fullMenu'];

/**
 * Hook personalizado para obtener el menú completo usando React Query.
 * Gestiona el fetching, caching, estado de carga y errores.
 */
export function useGetFullMenu() {
  return useQuery<Category[], ApiError>({ // Especifica los tipos para data y error
    queryKey: queryKey,
    queryFn: getFullMenu, // La función que realiza el fetch
    // Opciones adicionales de React Query (opcional):
    // staleTime: 5 * 60 * 1000, // 5 minutos antes de considerar los datos "stale"
    // cacheTime: 10 * 60 * 1000, // 10 minutos antes de limpiar datos no usados de la caché
    // refetchOnWindowFocus: false, // Evitar refetch al volver a la app
    // retry: 1, // Reintentar 1 vez en caso de error
  });
}