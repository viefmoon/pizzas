export interface BackendErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
}