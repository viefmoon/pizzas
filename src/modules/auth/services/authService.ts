import apiClient from "../../../app/services/apiClient";
import {
  AuthEmailLoginDto,
  LoginResponseDto,
  LoginFormInputs,
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
      // Intentar obtener un mensaje de error más específico si está disponible
      const apiError =
        (response.data as any)?.errors?.auth ||
        (response.data as any)?.errors?.password ||
        "credentialsIncorrect";
      // Mapear errores del backend a mensajes amigables
      const errorMessages: { [key: string]: string } = {
        credentialsIncorrect: "Usuario o contraseña incorrectos.",
        incorrectPassword: "La contraseña es incorrecta.",
      };
      throw new Error(errorMessages[apiError] || "Error al iniciar sesión.");
    }
    return response.data;
  }

  // Aquí podrían ir otros métodos relacionados con la autenticación
  // como logout, refreshToken, resetPassword, etc.
}

export const authService = new AuthService();
