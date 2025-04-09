// Define los tipos para el sistema de temas de la aplicación
import { z } from "zod";
import { MD3Theme } from "react-native-paper";

// Definición de las posibles preferencias de tema
// Restaurado: Volvemos a permitir 'system'
export const themePreferenceSchema = z.enum(["light", "dark", "system"]);
export type ThemePreference = z.infer<typeof themePreferenceSchema>;

// Clave para almacenar la preferencia de tema en AsyncStorage
export const THEME_PREFERENCE_STORAGE_KEY = "app:theme_preference";

// Valores constantes para facilitar el uso en el código
export const THEME_MODE = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system", // Restaurado
} as const;

// Extender el tema de Paper si es necesario
export interface AppTheme extends MD3Theme {
  // Aquí puedes agregar propiedades adicionales al tema si es necesario
}

// Tipo para el estado del tema en el store
export interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}
