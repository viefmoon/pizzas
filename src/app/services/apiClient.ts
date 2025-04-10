import { create } from "apisauce";
import { API_URL } from "@env";
import EncryptedStorage from "react-native-encrypted-storage";
import { useAuthStore } from "../store/authStore";

const apiClient = create({
  baseURL: API_URL,
  headers: {
    "Cache-Control": "no-cache",
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.addAsyncRequestTransform((request) => async () => {
  try {
    const token = await EncryptedStorage.getItem("auth_token");
    if (token) {
      if (!request.headers) request.headers = {};
      request.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error al recuperar el token de autenticación:", error);
  }
});

apiClient.addMonitor((response) => {
  if (response.status === 401 && !response.config?.url?.includes("/auth")) {
    console.warn("Acceso no autorizado detectado (401). Cerrando sesión...");
    const logout = useAuthStore.getState().logout;
    if (logout) {
      logout();
    }
  }

  if (!response.ok) {
    console.error("Problema en la petición API:", {
      problema: response.problem,
      url: response.config?.url,
      método: response.config?.method,
      estado: response.status,
    });
  }
});


export default apiClient;
