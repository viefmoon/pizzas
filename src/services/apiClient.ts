import { create } from "apisauce";
import { API_BASE_URL } from "@env";

// Define la URL base de tu API
const apiClient = create({
  baseURL: API_BASE_URL,
  headers: { "Cache-Control": "no-cache", Accept: "application/json" },
  // Puedes añadir un timeout si lo necesitas, por ejemplo 10 segundos
  // timeout: 10000,
});

// --- Interceptores (Ejemplos Opcionales) ---

// Ejemplo: Añadir token de autenticación a todas las peticiones (si usas tokens)
// import EncryptedStorage from 'react-native-encrypted-storage'; // Asumiendo que guardas el token aquí
// apiClient.addAsyncRequestTransform(request => async () => {
//   try {
//     const token = await EncryptedStorage.getItem('authToken'); // Clave donde guardas el token
//     if (token) {
//       request.headers['Authorization'] = `Bearer ${token}`;
//     }
//   } catch (error) {
//     console.error("Error retrieving auth token:", error);
//   }
// });

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
