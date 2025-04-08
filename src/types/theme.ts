// Define los tipos para el sistema de temas de la aplicación
import { z } from "zod";

// Definición de las posibles preferencias de tema
export const themePreferenceSchema = z.enum(["light", "dark", "system"]);
export type ThemePreference = z.infer<typeof themePreferenceSchema>;

// Clave para almacenar la preferencia de tema en AsyncStorage
export const THEME_PREFERENCE_STORAGE_KEY = "app:theme_preference";

// Valores constantes para facilitar el uso en el código
export const THEME_MODE = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;
