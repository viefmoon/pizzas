import apiClient from "../../../app/services/apiClient";
import { ApiError } from "../../../app/lib/errors";
import {
  AuthEmailLoginDto,
  LoginResponseDto,
  LoginFormInputs,
  RegisterFormInputs,
} from "../types/auth.types";

class AuthService {
  async login(loginData: LoginFormInputs): Promise<LoginResponseDto> {
    // Determinar si es email o username
    const isEmail = loginData.emailOrUsername.includes("@");
    const payload: AuthEmailLoginDto = {
      password: loginData.password,
      ...(isEmail
        ? { email: loginData.emailOrUsername }
        : { username: loginData.emailOrUsername }),
    };

    // Realizar la petición POST al endpoint de login
    const response = await apiClient.post<LoginResponseDto>(
      "/api/v1/auth/email/login",
      payload
    );

    // Apisauce envuelve la respuesta. Verificamos si fue exitosa.
    if (!response.ok || !response.data) {
      // Lanzar un ApiError estructurado
      throw ApiError.fromApiResponse(response.data, response.status);
    }
    return response.data;
  }

  async register(data: RegisterFormInputs): Promise<void> {
    const response = await apiClient.post<{ message?: string }>(
      "/api/v1/auth/email/register",
      data
    );

    if (!response.ok) {
      // Lanzar un ApiError estructurado
      throw ApiError.fromApiResponse(response.data, response.status);
    }
  }

  // Aquí podrían ir otros métodos relacionados con la autenticación
  // como logout, refreshToken, resetPassword, etc.
}

export const authService = new AuthService();
