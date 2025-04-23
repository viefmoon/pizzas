import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import type { Order } from '../types/orders.types';
import type { OrderDetailsForBackend } from '../components/OrderCartDetail'; // Importar la interfaz del payload
import { ApiError } from '@/app/lib/errors';
import { useSnackbarStore } from '@/app/store/snackbarStore';
import { getApiErrorMessage } from '@/app/lib/errorMapping';

// --- Query Keys (si se necesitan queries futuras para órdenes) ---
const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  // list: (filters: FindAllOrdersDto) => [...orderKeys.lists(), filters] as const, // Ejemplo
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