// Store para manejar el estado del tema de la aplicación
import React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme, Appearance } from "react-native"; // Restaurar Appearance

import {
  ThemePreference,
  THEME_PREFERENCE_STORAGE_KEY,
  THEME_MODE,
} from "../types/theme.types";
import { lightTheme, darkTheme } from "../styles/theme";

interface ThemeState {
  themePreference: ThemePreference;
  activeTheme: typeof lightTheme | typeof darkTheme;
  isSystemDarkMode: boolean | null; // Restaurado
  setThemePreference: (preference: ThemePreference) => void;
  setSystemDarkMode: (isDark: boolean | null) => void; // Restaurado
}

export const useThemeStore = create<ThemeState>()(
  persist(
    // 1. Función de definición del estado (set, get)
    (set, get) => ({
      // Estado inicial
      themePreference: THEME_MODE.SYSTEM, // Default: seguir al sistema
      activeTheme: lightTheme, // Default temporal seguro, se corregirá
      isSystemDarkMode: null, // Se establecerá por useSystemThemeDetector

      // Acción para cambiar la preferencia del usuario
      setThemePreference: (preference: ThemePreference) => {
        const { isSystemDarkMode } = get();
        set({ themePreference: preference }); // Guardar preferencia

        // Calcular y guardar el tema activo correspondiente
        if (preference === THEME_MODE.SYSTEM) {
          if (isSystemDarkMode !== null) { // Solo si sabemos el estado del sistema
            set({ activeTheme: isSystemDarkMode ? darkTheme : lightTheme });
          }
        } else {
          set({ activeTheme: preference === THEME_MODE.DARK ? darkTheme : lightTheme });
        }
      },

      // Acción para actualizar el estado del tema del sistema (llamado por useSystemThemeDetector)
      setSystemDarkMode: (isDark: boolean | null) => {
        const { themePreference } = get();
        set({ isSystemDarkMode: isDark }); // Actualizar estado interno

        // Si la preferencia es 'system', ajustar el tema activo
        if (themePreference === THEME_MODE.SYSTEM && isDark !== null) {
          set({ activeTheme: isDark ? darkTheme : lightTheme });
        }
      },
    }), // Fin de la función de definición del estado

    // 2. Objeto de configuración para persist
    {
      name: THEME_PREFERENCE_STORAGE_KEY, // Nombre de la clave en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // Usar AsyncStorage
      partialize: (state) => ({ themePreference: state.themePreference }), // Solo guardar 'themePreference'
      // onRehydrateStorage para asegurar que el estado inicial sea correcto después de cargar
      // onRehydrateStorage ahora SOLO establece la preferencia cargada.
      onRehydrateStorage: (persistedState) => {
        console.log("Hydrating theme preference:", persistedState?.themePreference);
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating theme store:", error);
            return;
          }
          if (!state) {
            console.warn("State not available during theme rehydration");
            return;
          }

          // Obtener preferencia guardada o usar SYSTEM por defecto
          let preference = persistedState?.themePreference;
          if (preference !== THEME_MODE.LIGHT && preference !== THEME_MODE.DARK && preference !== THEME_MODE.SYSTEM) {
            preference = THEME_MODE.SYSTEM;
          }

          // Solo aplicar la preferencia cargada al estado inicial
          state.themePreference = preference;

          // Si la preferencia cargada NO es SYSTEM, podemos calcular el tema activo aquí
          if (preference !== THEME_MODE.SYSTEM) {
             state.activeTheme = preference === THEME_MODE.DARK ? darkTheme : lightTheme;
             console.log(`Theme state rehydrated with explicit preference: ${preference}`);
          } else {
             // Si es SYSTEM, dejamos activeTheme como está (light por defecto)
             // y esperamos a que useSystemThemeDetector lo corrija.
             console.log("Theme state rehydrated with SYSTEM preference. Waiting for detector.");
             // No establecemos isSystemDarkMode aquí, lo hará el detector
          }
        };
      },
    } // Fin del objeto de configuración
  ) // Fin de persist
); // Fin de create

// Hook personalizado para detectar cambios en el tema del sistema y actualizarlo en el store
// Restaurar useSystemThemeDetector
export function useSystemThemeDetector() {
  const systemColorScheme = useColorScheme(); // Hook de React Native
  const setSystemDarkMode = useThemeStore((state) => state.setSystemDarkMode);

  // Usamos useRef para saber si es la primera ejecución del efecto
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    const isDarkMode = systemColorScheme === "dark";
    // console.log("System theme detector run:", isDarkMode ? 'dark' : 'light'); // Log más detallado si es necesario

    // Llamar a setSystemDarkMode siempre para actualizar el estado interno
    // Esto también recalculará activeTheme si preference es SYSTEM (gracias a la lógica en setSystemDarkMode)
    setSystemDarkMode(isDarkMode);

    // Si es la primera ejecución Y la preferencia es SYSTEM,
    // aseguramos que el activeTheme se establezca correctamente.
    // Aunque setSystemDarkMode ya lo hace, esto es una doble verificación inicial.
    if (isInitialMount.current && useThemeStore.getState().themePreference === THEME_MODE.SYSTEM) {
       console.log("Initial system theme detection, ensuring active theme is set...");
       // Usamos setState para actualizar directamente si es necesario, aunque setSystemDarkMode debería bastar
       useThemeStore.setState({ activeTheme: isDarkMode ? darkTheme : lightTheme });
    }

    // Marcar que ya no es la montura inicial
    isInitialMount.current = false;

  }, [systemColorScheme, setSystemDarkMode]); // Dependencias correctas
}
