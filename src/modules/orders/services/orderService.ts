import apiClient from "@/app/services/apiClient";
import { ApiError } from "@/app/lib/errors";
import { API_PATHS } from "@/app/constants/apiPaths";
import type { Order } from "../../../app/types/domain/order.types";
import type { FindAllOrdersDto } from "../types/orders.types"; // FindAllOrdersDto se queda aquí
import type { PaginatedResponse } from "../../../app/types/api.types"; // Importar PaginatedResponse
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
  /**
   * Obtiene una lista paginada de órdenes con filtros.
   * @param filters - Opciones de filtrado y paginación.
   * @returns Una promesa que resuelve a una respuesta paginada de órdenes.
   * @throws {ApiError} Si la petición falla.
   */
  getOrders: async (filters: FindAllOrdersDto = {}): Promise<PaginatedResponse<Order>> => {
    // Limpiar filtros undefined y preparar parámetros
    const queryParams: Record<string, any> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) {
        // Pasar el array directamente, el cliente API (axios) lo manejará
        if (key !== 'page' && key !== 'limit') {
           queryParams[key] = value;
        }
      }
    }

    // Añadir page y limit explícitamente
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    queryParams.page = page;
    queryParams.limit = limit;

    // Revertir a esperar la respuesta original [data, totalCount]
    const response = await apiClient.get<[Order[], number]>(API_PATHS.ORDERS, queryParams);

    if (!response.ok || !response.data || !Array.isArray(response.data) || response.data.length !== 2) {
      console.error("[orderService.getOrders] Failed to fetch orders:", response);
      throw ApiError.fromApiResponse(response.data, response.status);
    }

    const [data, total] = response.data;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  },
  /**
   * Obtiene las órdenes abiertas del día actual.
   * @returns Una promesa que resuelve a un array de órdenes abiertas.
   * @throws {ApiError} Si la petición falla.
   */
  getOpenOrdersToday: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>(API_PATHS.ORDERS_OPEN_TODAY);

    if (!response.ok || !response.data || !Array.isArray(response.data)) {
      console.error("[orderService.getOpenOrdersToday] Failed to fetch open orders:", response);
      throw ApiError.fromApiResponse(response.data, response.status);
    }
    return response.data;
  },
  /**
   * Solicita la impresión del ticket de cocina para una orden específica en una impresora dada.
   * @param orderId - El ID de la orden.
   * @param printerId - El ID de la impresora.
   * @returns Una promesa que resuelve si la solicitud fue exitosa (puede no devolver datos).
   * @throws {ApiError} Si la petición falla.
   */
  printOrderTicket: async (orderId: string, printerId: string): Promise<void> => { // Renombrar función para claridad
    const url = API_PATHS.PRINT_ORDER_TICKET; // Usar la nueva ruta fija
    // El cuerpo ahora contiene orderId y printerId
    const body = { orderId, printerId };
    const response = await apiClient.post<any>(url, body); // Usar la nueva URL y cuerpo

    // Asumimos que una respuesta OK (2xx) significa éxito, incluso si no hay cuerpo.
    if (!response.ok) {
      console.error(`[orderService.printOrderTicket] Failed for order ${orderId} on printer ${printerId}:`, response);
      throw ApiError.fromApiResponse(response.data, response.status);
    }
    // No se retorna nada en caso de éxito
  },
  // Añadir aquí otras funciones del servicio de órdenes si son necesarias (findOne, update, etc.)
};