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
      // onRehydrateStorage: Se ejecuta DESPUÉS de que el estado se ha rehidratado.
      // Aquí calculamos el estado inicial de activeTheme y isSystemDarkMode basado en la preferencia cargada.
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating theme store:", error);
            return;
          }
          if (!state) {
            console.warn("State not available during theme rehydration callback");
            return;
          }

          const preference = state.themePreference; // Ya tiene el valor cargado o inicial
          // console.log(`Theme store rehydrated. Initial preference: ${preference}`); // Log eliminado

          if (preference === THEME_MODE.LIGHT) {
            state.activeTheme = lightTheme;
            state.isSystemDarkMode = Appearance.getColorScheme() === 'dark'; // Actualizar por si acaso
            // console.log("Rehydrated with LIGHT theme."); // Log eliminado
          } else if (preference === THEME_MODE.DARK) {
            state.activeTheme = darkTheme;
            state.isSystemDarkMode = Appearance.getColorScheme() === 'dark'; // Actualizar por si acaso
            // console.log("Rehydrated with DARK theme."); // Log eliminado
          } else { // preference === THEME_MODE.SYSTEM
            const systemScheme = Appearance.getColorScheme(); // Intentar obtener síncronamente
            const isSystemDark = systemScheme === 'dark';
            state.isSystemDarkMode = isSystemDark;
            state.activeTheme = isSystemDark ? darkTheme : lightTheme;
            // console.log(`Rehydrated with SYSTEM theme. Detected system scheme: ${systemScheme ?? 'unknown'}. Active theme set.`); // Log eliminado
            // useSystemThemeDetector refinará esto si cambia dinámicamente
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

  // Simplificamos useEffect: Solo llama a setSystemDarkMode cuando el esquema del sistema cambia.
  // La lógica en setSystemDarkMode (líneas 48-56) ya se encarga de actualizar activeTheme si es necesario.
  React.useEffect(() => {
    const isDarkMode = systemColorScheme === "dark";
    // Log eliminado
    // Comprobar si el valor realmente cambió antes de llamar a set para evitar posibles bucles sutiles
    if (useThemeStore.getState().isSystemDarkMode !== isDarkMode) {
        setSystemDarkMode(isDarkMode);
    }
  }, [systemColorScheme, setSystemDarkMode]);
}
