import { ERROR_CODES, ApiErrorCode } from '../constants/apiErrorCodes';
import { BackendErrorResponse } from '../types/api.types';
import { AxiosError } from 'axios'; // Import AxiosError type

export class ApiError extends Error {
  public readonly code: ApiErrorCode | string;
  public readonly status: number;
  public readonly details?: any;
  public readonly originalMessage: string;

  constructor(
    code: ApiErrorCode | string = ERROR_CODES.UNKNOWN_API_ERROR,
    backendMessage: string = "Ocurrió un error en la API",
    status: number = 500,
    details?: any
  ) {
    super(backendMessage);
    this.code = code;
    this.status = status;
    this.details = details;
    this.originalMessage = backendMessage;
    this.name = 'ApiError';
    // Mantener compatibilidad con entornos Node/V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Creates an ApiError instance from an apisauce ApiResponse (legacy or direct use).
   * Kept for potential compatibility, but prefer fromAxiosError.
   */
  static fromApiResponse(
    responseData: BackendErrorResponse | any,
    responseStatus?: number
  ): ApiError {
    const status = responseStatus ?? responseData?.statusCode ?? 500;
    const code = responseData?.code ?? ERROR_CODES.UNKNOWN_API_ERROR;
    const message = responseData?.message ?? 'Error desconocido de la API.';
    const details = responseData?.details;
    // Uses the main constructor signature: code, message, status, details
    return new ApiError(code, message, status, details);
  }

  /**
   * Creates an ApiError instance from an AxiosError.
   * Extracts relevant information from the Axios error response.
   */
  static fromAxiosError(error: any): ApiError {
    if (error instanceof ApiError) {
      // If it's already an ApiError (e.g., from refresh failure), return it directly
      return error;
    }

    // Use type assertion for better property access
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data as BackendErrorResponse | any;
    const status = axiosError.response?.status ?? 500;
    const code = responseData?.code ?? ERROR_CODES.UNKNOWN_API_ERROR;
    // Use original Axios message if backend message is unavailable
    const message = responseData?.message ?? axiosError.message ?? 'Error desconocido de la API.';
    // Include full response data as details if no specific 'details' property exists
    const details = responseData?.details ?? responseData;

    console.warn("Creating ApiError from AxiosError:", { status, code, message }); // Log warning for easier debugging
    // Uses the main constructor signature: code, message, status, details
    return new ApiError(code, message, status, details);
  }

   /**
   * Creates a specific ApiError for refresh token failures.
   */
  static fromRefreshError(error: any): ApiError {
    console.error("Creating ApiError from RefreshError:", error);
    // Note: Logout logic should primarily reside in the refreshToken function itself

    // Uses the main constructor signature: code, message, status, details
    return new ApiError(
      ERROR_CODES.REFRESH_FAILED, // Specific code for refresh failure - Ensure this exists in ERROR_CODES
      error?.message || "La sesión ha expirado o no se pudo renovar.", // Message
      401, // Status (force 401)
      error // Details (original error)
    );
  }
} // End of ApiError class definition