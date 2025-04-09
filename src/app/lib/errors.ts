// src/app/lib/errors.ts
import { ERROR_CODES, ApiErrorCode } from '../constants/apiErrorCodes';
import { BackendErrorResponse } from '../types/api.types';

export class ApiError extends Error {
  public readonly code: ApiErrorCode | string;
  public readonly status: number;
  public readonly details?: any;
  public readonly originalMessage: string; // Guardamos el mensaje original del backend

  constructor(
    code: ApiErrorCode | string = ERROR_CODES.UNKNOWN_API_ERROR,
    backendMessage: string = "Ocurrió un error en la API",
    status: number = 500,
    details?: any
  ) {
    super(backendMessage); // Usamos mensaje del backend para logging
    this.code = code;
    this.status = status;
    this.details = details;
    this.originalMessage = backendMessage;
    this.name = 'ApiError';
    // Mantener el stack trace correcto para V8 (Node, Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  static fromApiResponse(
    responseData: BackendErrorResponse | any,
    responseStatus?: number
  ): ApiError {
    // Intenta obtener el status de la respuesta directa o del cuerpo
    const status = responseStatus ?? responseData?.statusCode ?? 500;
    // Intenta obtener el código del cuerpo, si no, usa UNKNOWN_API_ERROR
    const code = responseData?.code ?? ERROR_CODES.UNKNOWN_API_ERROR;
    // Intenta obtener el mensaje del cuerpo, si no, usa un mensaje genérico
    const message = responseData?.message ?? 'Error desconocido de la API.';
    // Obtiene los detalles si existen
    const details = responseData?.details;
    // Crea y devuelve la instancia de ApiError
    return new ApiError(code, message, status, details);
  }
}