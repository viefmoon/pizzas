import { create } from "apisauce";
import { API_URL } from "@env";
import EncryptedStorage from "react-native-encrypted-storage";
import { useAuthStore } from "../store/authStore";

// Define la URL base de tu API
const apiClient = create({
  baseURL: API_URL,
  headers: { "Cache-Control": "no-cache", Accept: "application/json" },
  // Puedes añadir un timeout si lo necesitas, por ejemplo 10 segundos
  // timeout: 10000,
});

// Interceptor para añadir el token de autenticación
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

// Monitor para manejar errores de autenticación (401)
apiClient.addMonitor((response) => {
  if (response.status === 401 && !response.config?.url?.includes("/auth")) {
    console.warn("Acceso no autorizado detectado (401). Cerrando sesión...");
    // Obtener la función de logout del store y ejecutarla
    const logout = useAuthStore.getState().logout;
    if (logout) {
      logout();
    }
  }

  // Log de errores generales
  if (!response.ok) {
    console.error("Problema en la petición API:", {
      problema: response.problem,
      url: response.config?.url,
      método: response.config?.method,
      estado: response.status,
    });
  }
});

// --- Interceptores (Ejemplos Opcionales) ---

// Ejemplo: Monitor para manejar errores comunes como 401 Unauthorized
// import { tuAuthStore } from '../store/authStore'; // Asumiendo un store Zustand para auth
// apiClient.addMonitor(response => {
//   if (response.status === 401 && !response.config?.url?.includes('/login')) { // Evita bucles en login
//     console.warn('Unauthorized access detected (401). Logging out.');
//     // Llama a tu función de logout global
//     // tuAuthStore.getState().logout();
//   }
//   // Puedes añadir más monitores para otros códigos de estado o problemas
//   if (!response.ok) {
//     console.error('API Request Problem:', response.problem, response);
//   }
// });

// --- Fin Interceptores ---

export default apiClient;
