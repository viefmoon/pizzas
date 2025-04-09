import { create } from "zustand";
import EncryptedStorage from "react-native-encrypted-storage";
import { STORAGE_KEYS } from "../constants/storageKeys"; // Importar las claves

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  // Añadir acción para setear estado directamente (usado en inicialización)
  setAuthState: (newState: Partial<AuthState>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  setToken: async (token: string) => {
    try {
      await EncryptedStorage.setItem("auth_token", token);
      set({ token, isAuthenticated: true });
    } catch (error) {
      console.error("Error al guardar el token:", error);
    }
  },
  logout: async () => {
    try {
      // Solo eliminar el token de autenticación al cerrar sesión
      await EncryptedStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      set({ token: null, isAuthenticated: false });
      console.log("Sesión cerrada. Las credenciales recordadas (si existen) se mantienen."); // Mensaje actualizado
    } catch (error) {
      console.error("Error al cerrar sesión (eliminando token):", error); // Mensaje actualizado
    }
  },
  // Implementación de la nueva acción
  setAuthState: (newState) => set(newState),
}));
