import { create } from "zustand";
import EncryptedStorage from "react-native-encrypted-storage";
const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setAccessToken: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void) => ({
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  setTokens: async (accessToken: string, refreshToken: string) => {
    try {
      await EncryptedStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      await EncryptedStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      set({ accessToken, refreshToken, isAuthenticated: true });
    } catch (error) {
      console.error("Error guardando tokens:", error);
    }
  },
  setAccessToken: async (accessToken: string) => {
    try {
      await EncryptedStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      set({ accessToken, isAuthenticated: true });
    } catch (error) {
      console.error("Error guardando access token:", error);
    }
  },
  logout: async () => {
    try {
      await EncryptedStorage.removeItem(AUTH_TOKEN_KEY);
      await EncryptedStorage.removeItem(REFRESH_TOKEN_KEY);
      set({ accessToken: null, refreshToken: null, isAuthenticated: false });
      console.log("Sesión cerrada. Las credenciales recordadas (si existen) se mantienen.");
    } catch (error) {
      console.error("Error al cerrar sesión (eliminando token):", error);
    }
  },
}));

export const initializeAuthStore = async () => {
  try {
    const accessToken = await EncryptedStorage.getItem(AUTH_TOKEN_KEY);
    const refreshToken = await EncryptedStorage.getItem(REFRESH_TOKEN_KEY);
    if (accessToken && refreshToken) {
      useAuthStore.setState({ accessToken, refreshToken, isAuthenticated: true });
      console.log("AuthStore inicializado con tokens.");
    } else {
       useAuthStore.setState({ accessToken: null, refreshToken: null, isAuthenticated: false });
       console.log("AuthStore inicializado sin tokens.");
    }
  } catch (error) {
    console.error("Error inicializando auth store:", error);
     useAuthStore.setState({ accessToken: null, refreshToken: null, isAuthenticated: false });
  }
};
