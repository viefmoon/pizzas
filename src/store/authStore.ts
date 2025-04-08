import { create } from "zustand";
import EncryptedStorage from "react-native-encrypted-storage";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
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
      await EncryptedStorage.removeItem("auth_token");
      set({ token: null, isAuthenticated: false });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  },
}));
