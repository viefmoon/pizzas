import { ERROR_CODES, ApiErrorCode } from '../constants/apiErrorCodes';
import { BackendErrorResponse } from '../types/api.types';

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
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  static fromApiResponse(
    responseData: BackendErrorResponse | any,
    responseStatus?: number
  ): ApiError {
    const status = responseStatus ?? responseData?.statusCode ?? 500;
    const code = responseData?.code ?? ERROR_CODES.UNKNOWN_API_ERROR;
    const message = responseData?.message ?? 'Error desconocido de la API.';
    const details = responseData?.details;
    return new ApiError(code, message, status, details);
  }
}