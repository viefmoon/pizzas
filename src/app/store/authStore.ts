import { create } from "zustand";
import EncryptedStorage from "react-native-encrypted-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
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
      await EncryptedStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      set({ token: null, isAuthenticated: false });
      console.log("Sesión cerrada. Las credenciales recordadas (si existen) se mantienen.");
    } catch (error) {
      console.error("Error al cerrar sesión (eliminando token):", error);
    }
  },
  setAuthState: (newState) => set(newState),
}));
