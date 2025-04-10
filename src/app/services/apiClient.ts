import { create, ApiResponse, ApiErrorResponse } from "apisauce";
import { API_URL } from "@env";
import EncryptedStorage from "react-native-encrypted-storage";
import { useAuthStore } from "../store/authStore";

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function refreshToken(): Promise<string | null> {
  try {
    const currentRefreshToken =
      await EncryptedStorage.getItem(REFRESH_TOKEN_KEY);
    if (!currentRefreshToken) {
      console.warn("REFRESH: No refresh token found in EncryptedStorage.");
      await useAuthStore.getState().logout(); // Logout si no hay refresh token
      return null;
    }

    console.log(
      `REFRESH: Attempting refresh. Found token? ${!!currentRefreshToken}`
    );
    // Por seguridad, no loguear el token completo. Podrías loguear los últimos 4 caracteres si necesitas identificarlo:
    const refreshApiClient = create({ baseURL: API_URL });
    const response: ApiResponse<{
      accessToken: string;
      refreshToken?: string;
    }> = await refreshApiClient.post("/api/v1/auth/refresh", {
      refreshToken: currentRefreshToken,
    });

    if (response.ok && response.data?.accessToken) {
      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      console.log("Token refreshed successfully.");
      await useAuthStore.getState().setAccessToken(newAccessToken);

      if (newRefreshToken && newRefreshToken !== currentRefreshToken) {
        console.log("Updating refresh token as well.");
        await EncryptedStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        useAuthStore.setState({ refreshToken: newRefreshToken });
      }

      return newAccessToken;
    } else {
      console.error("REFRESH: Refresh token request failed.");
      console.error("REFRESH: Status:", response.status);
      console.error("REFRESH: Problem:", response.problem);
      console.error("REFRESH: Headers:", response.headers);
      console.error("REFRESH: Data:", response.data);
      await useAuthStore.getState().logout();
      return null;
    }
  } catch (error) {
    console.error("REFRESH: Unexpected error during refresh process:", error);
    await useAuthStore.getState().logout();
    return null;
  }
}

const apiClient = create({
  baseURL: API_URL,
  headers: {
    "Cache-Control": "no-cache",
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.addAsyncRequestTransform(async (request) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken && !request.url?.includes("/auth/")) {
    if (!request.headers) request.headers = {};
    request.headers["Authorization"] = `Bearer ${accessToken}`;
  }
});

apiClient.addMonitor(async (response: ApiResponse<any>) => {
  const originalRequest = response.config;

  if (!response.ok && response.status !== 401) {
    console.error("Problema en la petición API:", {
      problema: response.problem,
      url: originalRequest?.url,
      método: originalRequest?.method,
      estado: response.status,
      data: response.data,
    });
    return;
  }

  if (
    response.status === 401 &&
    originalRequest &&
    !originalRequest.url?.includes("/auth/refresh")
  ) {
    console.warn(
      `401 Unauthorized detectado para ${originalRequest.url}. Intentando refrescar token...`
    );

    if (isRefreshing) {
      console.log(
        "Refresco en curso, añadiendo petición a la cola:",
        originalRequest.url
      );
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          console.log(
            "Procesando petición en cola con nuevo token:",
            originalRequest.url
          );
          if (originalRequest.headers && token) {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
          }
          const method = originalRequest.method?.toLowerCase();
          if (method && typeof (apiClient as any)[method] === "function") {
            return (apiClient as any)[method](
              originalRequest.url,
              originalRequest.data,
              { headers: originalRequest.headers }
            );
          } else {
            console.error(
              "Método original desconocido para reintentar petición en cola:",
              method
            );
            return Promise.reject(response);
          }
        })
        .catch((err) => {
          console.error("Error en petición en cola después del refresco:", err);
          return Promise.reject(err);
        });
    }

    isRefreshing = true;

    try {
      const newAccessToken = await refreshToken();

      if (newAccessToken) {
        console.log(
          "Token refrescado. Procesando cola y reintentando petición original:",
          originalRequest.url
        );
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }
        const method = originalRequest.method?.toLowerCase();
        if (method && typeof (apiClient as any)[method] === "function") {
          return (apiClient as any)[method](
            originalRequest.url,
            originalRequest.data,
            { headers: originalRequest.headers }
          );
        } else {
          console.error(
            "Método original desconocido para reintentar petición principal:",
            method
          );
          return Promise.reject(response);
        }
      } else {
        console.warn("Refresco fallido o no posible. Logout realizado.");
        const error = new Error(
          "Session expired or refresh failed. Please login again."
        );
        processQueue(error, null);
        return response;
      }
    } catch (error) {
      console.error(
        "Error inesperado durante el proceso de refresco/reintento:",
        error
      );
      processQueue(error as Error, null);
      return response;
    } finally {
      isRefreshing = false;
      console.log("Flag isRefreshing puesto a false.");
    }
  }
});

export default apiClient;
