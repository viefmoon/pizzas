// src/app/lib/errorMapping.ts
import { ApiError } from './errors';
import { ERROR_CODES, ApiErrorCode } from '../constants/apiErrorCodes';
import { AxiosError } from 'axios'; // Importar AxiosError si se usa directamente
import { ApiResponse } from 'apisauce'; // Importar ApiResponse para referencia si es necesario, ProblemKind no se exporta así

// Mapeo directo de códigos a mensajes en español (¡Actualiza según tus necesidades!)
const errorCodeMessages: { [key in ApiErrorCode | string]?: string } = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: "El correo/usuario o la contraseña son incorrectos.",
  [ERROR_CODES.AUTH_INCORRECT_PASSWORD]: "La contraseña es incorrecta.",
  [ERROR_CODES.AUTH_DUPLICATE_EMAIL]: "Este correo electrónico ya está registrado. Intenta iniciar sesión.",
  [ERROR_CODES.AUTH_DUPLICATE_USERNAME]: "Este nombre de usuario ya está en uso. Elige otro.",
  [ERROR_CODES.VALIDATION_ERROR]: "Por favor, revisa la información ingresada.", // Mensaje genérico para validación
  [ERROR_CODES.RESOURCE_NOT_FOUND]: "El recurso solicitado no se encontró.",
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: "Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.",
  [ERROR_CODES.NETWORK_ERROR]: "Error de red. Verifica tu conexión e inténtalo de nuevo.",
  [ERROR_CODES.API_CLIENT_ERROR]: "Error al comunicar con el servidor.",
  [ERROR_CODES.AUTH_UNAUTHORIZED]: "No autorizado. Por favor, inicia sesión de nuevo.",
  [ERROR_CODES.AUTH_FORBIDDEN]: "No tienes permiso para realizar esta acción.",
  [ERROR_CODES.CONFLICT_ERROR]: "Hubo un conflicto al procesar tu solicitud.", // Puedes hacerlo más específico si el backend da más detalles
  [ERROR_CODES.UNKNOWN_API_ERROR]: "Ocurrió un error inesperado al procesar tu solicitud.",
  [ERROR_CODES.UNKNOWN_ERROR]: "Ocurrió un error desconocido.",
   // Puedes añadir mensajes genéricos para status codes si quieres
  [`status_401`]: "No autorizado. Por favor, inicia sesión de nuevo.",
  [`status_403`]: "No tienes permiso para realizar esta acción.",
  [`status_404`]: "No encontrado.",
  [`status_422`]: "Los datos enviados son inválidos o incompletos.", // Común para errores de validación del backend
  [`status_500`]: "Error interno del servidor.",
  // ... (añade más mapeos para otros códigos específicos que definas)
};

// Función para obtener el mensaje legible (SIN i18n)
export function getApiErrorMessage(error: unknown): string {
  const defaultMessage = "Ocurrió un error inesperado.";

  if (error instanceof ApiError) {
    // 1. Intenta obtener el mensaje mapeado por código específico
    let message = errorCodeMessages[error.code];

    // 2. Si no hay mensaje para el código, intenta por status code genérico
    if (!message) {
      message = errorCodeMessages[`status_${error.status}`];
    }

    // 3. Si aún no hay mensaje, usa el mensaje original del backend (si existe y no es genérico)
    //    A menudo, los mensajes del backend no son ideales para el usuario final, pero pueden ser un fallback.
    //    Podrías añadir lógica aquí para evitar mostrar mensajes muy técnicos.
    if (!message && error.originalMessage && error.code !== ERROR_CODES.UNKNOWN_API_ERROR) {
       message = error.originalMessage;
    }

    // 4. Si nada funcionó, usa el default
    return message || defaultMessage;

  } else if (error instanceof AxiosError) {
     // Errores de red o de cliente antes de que Apisauce los procese (si usas Axios directamente)
    if (error.message === 'Network Error' || !error.response) {
      return errorCodeMessages[ERROR_CODES.NETWORK_ERROR] || "Error de red.";
    }
    // Intenta mapear el status code de la respuesta de Axios si existe
    if (error.response?.status) {
        const statusMessage = errorCodeMessages[`status_${error.response.status}`];
        if (statusMessage) return statusMessage;
    }
    // Otro error de Axios no manejado como ApiError
    return errorCodeMessages[ERROR_CODES.UNKNOWN_API_ERROR] || defaultMessage;

  } else if (error instanceof Error) {
     // Otros errores genéricos de JS
     // Comprobar mensajes comunes de error de red en React Native / Expo
     if (error.message.toLowerCase().includes('network request failed') ||
         error.message.toLowerCase().includes('failed to fetch')) {
       return errorCodeMessages[ERROR_CODES.NETWORK_ERROR] || "Error de red.";
     }
     // Devolver el mensaje del error o uno genérico si el mensaje es muy técnico
     return error.message && !error.message.toLowerCase().includes('undefined')
            ? error.message
            : defaultMessage;
  } else {
    // Si no es un objeto Error (podría ser un string u otra cosa)
    return defaultMessage;
  }
}

// Función auxiliar para mapear problemas de Apisauce (sin i18n)
// Esta función es útil si usas el `problem` directamente del monitor de Apisauce
export function mapApisauceProblem(problem: ApiResponse<any>['problem']): string {
   switch (problem) {
      case 'NETWORK_ERROR':
      case 'CONNECTION_ERROR':
      case 'TIMEOUT_ERROR':
         return errorCodeMessages[ERROR_CODES.NETWORK_ERROR] || "Error de red.";
      case 'CLIENT_ERROR': // Errores 4xx genéricos (si no se mapeó antes por status/código)
         // Podrías intentar obtener un mensaje más específico basado en el status si lo tienes disponible aquí
         return errorCodeMessages[ERROR_CODES.API_CLIENT_ERROR] || "Error del cliente.";
      case 'SERVER_ERROR': // Errores 5xx genéricos
         return errorCodeMessages[ERROR_CODES.INTERNAL_SERVER_ERROR] || "Error del servidor.";
      case 'CANCEL_ERROR':
         return 'La solicitud fue cancelada.'; // Mensaje específico para cancelación
      case 'UNKNOWN_ERROR':
      default:
         // Fallback para problemas desconocidos de Apisauce
         return errorCodeMessages[ERROR_CODES.UNKNOWN_API_ERROR] || "Error al comunicar con el servidor.";
   }
}