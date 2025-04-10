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
    const isEmail = loginData.emailOrUsername.includes("@");
    const payload: AuthEmailLoginDto = {
      password: loginData.password,
      ...(isEmail
        ? { email: loginData.emailOrUsername }
        : { username: loginData.emailOrUsername }),
    };

    const response = await apiClient.post<LoginResponseDto>(
      "/api/v1/auth/email/login",
      payload
    );

    if (!response.ok || !response.data) {
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
      throw ApiError.fromApiResponse(response.data, response.status);
    }
  }

}

export const authService = new AuthService();
