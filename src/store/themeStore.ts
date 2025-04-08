// Store para manejar el estado del tema de la aplicación
import React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

import {
  ThemePreference,
  THEME_PREFERENCE_STORAGE_KEY,
  THEME_MODE,
} from "../types/theme";
import { lightTheme, darkTheme } from "../styles/theme";

interface ThemeState {
  themePreference: ThemePreference;
  activeTheme: typeof lightTheme | typeof darkTheme;
  isSystemDarkMode: boolean | null;
  setThemePreference: (preference: ThemePreference) => void;
  setSystemDarkMode: (isDark: boolean | null) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Valor por defecto: usar el tema del sistema
      themePreference: THEME_MODE.SYSTEM,
      // Por defecto comenzamos con el tema claro hasta que detectemos la preferencia del sistema
      activeTheme: lightTheme,
      // Estado que guarda la preferencia del sistema
      isSystemDarkMode: null,

      setThemePreference: (preference: ThemePreference) => {
        const { isSystemDarkMode } = get();

        // Actualiza la preferencia del usuario
        set({ themePreference: preference });

        // Determina el tema activo basado en la nueva preferencia
        if (preference === THEME_MODE.SYSTEM) {
          // Si es 'system', usa lo que indique el sistema
          set({ activeTheme: isSystemDarkMode ? darkTheme : lightTheme });
        } else {
          // Si es 'light' o 'dark', usa el tema correspondiente
          set({
            activeTheme:
              preference === THEME_MODE.DARK ? darkTheme : lightTheme,
          });
        }
      },

      setSystemDarkMode: (isDark: boolean | null) => {
        const { themePreference } = get();

        // Actualiza el estado de la preferencia del sistema
        set({ isSystemDarkMode: isDark });

        // Si la preferencia actual es 'system', actualiza el tema activo
        if (themePreference === THEME_MODE.SYSTEM && isDark !== null) {
          set({ activeTheme: isDark ? darkTheme : lightTheme });
        }
      },
    }),
    {
      name: THEME_PREFERENCE_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // Solo persistimos la preferencia del usuario, no el tema activo
      partialize: (state) => ({ themePreference: state.themePreference }),
    }
  )
);

// Hook personalizado para detectar cambios en el tema del sistema y actualizarlo en el store
export function useSystemThemeDetector() {
  const systemColorScheme = useColorScheme();
  const setSystemDarkMode = useThemeStore((state) => state.setSystemDarkMode);

  React.useEffect(() => {
    // Actualiza el estado con el tema detectado del sistema (null si no se puede detectar)
    const isDarkMode = systemColorScheme === "dark";
    setSystemDarkMode(isDarkMode);
  }, [systemColorScheme, setSystemDarkMode]);
}
