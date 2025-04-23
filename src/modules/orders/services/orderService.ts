import apiClient from "@/app/services/apiClient";
import { ApiError } from "@/app/lib/errors";
import { API_PATHS } from "@/app/constants/apiPaths";
import type { Order } from "../types/orders.types"; // Asumiendo que Order representa la respuesta
import type { OrderDetailsForBackend } from "../components/OrderCartDetail"; // Importar la interfaz del payload

/**
 * Crea una nueva orden en el backend.
 * @param orderData - Los detalles completos de la orden a crear.
 * @returns Una promesa que resuelve a la orden creada.
 * @throws {ApiError} Si la petición falla.
 */
const createOrder = async (orderData: OrderDetailsForBackend): Promise<Order> => {
  // Asegúrate de que la ruta sea correcta para crear órdenes
  const response = await apiClient.post<Order>(API_PATHS.ORDERS, orderData); // Usar API_PATHS.ORDERS si existe, o la ruta directa '/api/v1/orders'

  if (!response.ok || !response.data) {
    console.error("[orderService.createOrder] Failed to create order:", response);
    throw ApiError.fromApiResponse(
      response.data, // Puede ser BackendErrorResponse o any
      response.status
    );
  }
  // Asumiendo que la API devuelve la orden creada como tipo Order
  return response.data;
};

export const orderService = {
  createOrder,
  // Añadir aquí otras funciones del servicio de órdenes si son necesarias (findAll, findOne, update, etc.)
};