import { useMemo } from 'react'; // Importar useMemo

import { useMutation, useQuery, useQueries, useQueryClient, UseQueryResult, QueryObserverResult } from '@tanstack/react-query'; // Añadir useQueries y QueryObserverResult
import { orderService } from '../services/orderService';
import { OrderStatus } from '../types/orders.types'; // Importar como valor
import type { Order } from '../../../app/types/domain/order.types'; // Importar Order como tipo
import type { OrderDetailsForBackend } from '../components/OrderCartDetail';
// Asumiendo que FindAllOrdersDto está definido en types/orders.types.ts basado en el backend
import type { FindAllOrdersDto } from '../types/orders.types';
import type { PaginatedResponse } from '../../../app/types/api.types'; // Corregir ruta relativa
import { ApiError } from '@/app/lib/errors';
import { useSnackbarStore } from '@/app/store/snackbarStore';
import { getApiErrorMessage } from '@/app/lib/errorMapping';

// --- Query Keys (si se necesitan queries futuras para órdenes) ---
const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: FindAllOrdersDto) => [...orderKeys.lists(), filters] as const,
  openToday: () => [...orderKeys.all, 'list', 'open-today'] as const, // Nueva clave para órdenes abiertas del día
  details: () => [...orderKeys.all, 'detail'] as const,
  // detail: (id: string) => [...orderKeys.details(), id] as const, // Ejemplo
};

/**
 * Hook para crear una nueva orden.
 */
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return useMutation<Order, ApiError, OrderDetailsForBackend>({
    mutationFn: orderService.createOrder,
    onSuccess: (newOrder) => {
      // Invalidar queries relevantes si es necesario (ej. lista de órdenes)
      // queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // El mensaje de éxito se maneja en el componente que llama a la mutación
      console.log("Orden creada con éxito en backend:", newOrder);
    },
    onError: (error) => {
      // El mensaje de error se maneja en el componente que llama a la mutación
      // Pero podemos loguearlo aquí también
      console.error('Error en useCreateOrderMutation:', error);
      const message = getApiErrorMessage(error);
      // Opcional: Mostrar snackbar genérico desde aquí si se prefiere
      // showSnackbar({ message: `Error al crear orden: ${message}`, type: 'error' });
    },
  });
};

// Añadir aquí otros hooks para órdenes si son necesarios (useGetOrders, useUpdateOrder, etc.)

/**
 * Hook para obtener la lista de órdenes con filtros y paginación.
 */
export const useGetOrdersQuery = (
  filters: FindAllOrdersDto = {},
  options?: { enabled?: boolean }
): UseQueryResult<PaginatedResponse<Order>, ApiError> => {
  const queryKey = orderKeys.list(filters);
  return useQuery<PaginatedResponse<Order>, ApiError>({
    queryKey: queryKey,
    queryFn: () => orderService.getOrders(filters), // Usar la función del servicio que añadiremos
    enabled: options?.enabled ?? true,
  });
};

/**
 * Hook para obtener las órdenes abiertas (PENDING, IN_PROGRESS, READY).
 */
/**
 * Hook para solicitar la impresión del ticket de cocina.
 */
export const usePrintKitchenTicketMutation = () => {
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  // Definir el tipo de las variables de la mutación
  type PrintVariables = { orderId: string; printerId: string };

  return useMutation<void, ApiError, PrintVariables>({
    mutationFn: ({ orderId, printerId }) => orderService.printOrderTicket(orderId, printerId), // Usar la función renombrada
    onSuccess: (_, variables) => {
      // Usar el número diario si está disponible en las variables o buscarlo si es necesario
      // Por ahora, usamos solo el ID para el mensaje
      showSnackbar({ message: `Ticket de cocina para orden ID ${variables.orderId} enviado a impresora.`, type: 'success' });
      // No es necesario invalidar queries aquí, ya que solo es una acción
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      showSnackbar({ message: `Error al imprimir ticket: ${message}`, type: 'error' });
      console.error('Error printing kitchen ticket:', error);
    },
  });
};

export const useGetOpenOrdersQuery = (
  options?: { enabled?: boolean }
): UseQueryResult<Order[], ApiError> => { // Devuelve Order[] directamente
  const queryKey = orderKeys.openToday(); // Usar la nueva clave específica

  return useQuery<Order[], ApiError>({
    queryKey: queryKey,
    queryFn: () => orderService.getOpenOrdersToday(), // Llamar a la nueva función del servicio
    enabled: options?.enabled ?? true,
    staleTime: 1 * 60 * 1000, // Refrescar cada minuto (ajustar según necesidad)
  });

  // La lógica de useQueries y combinación se elimina
};

