// Configuración y exportación de temas para react-native-paper
import { MD3LightTheme, MD3DarkTheme, useTheme } from "react-native-paper";
import type { MD3Typescale } from "react-native-paper/lib/typescript/types";
import { lightColors, darkColors } from "./colors";
import { typography } from "./typography";

// Extender el tipo MD3Colors para incluir nuestros colores personalizados
declare global {
  namespace ReactNativePaper {
    interface MD3Colors {
      success: string;
      successContainer: string;
      onSuccessContainer: string;
      warning: string;
      warningContainer: string;
      onWarningContainer: string;
      info: string;
      infoContainer: string;
      onInfoContainer: string;
    }
  }
}

// Define el espacio entre elementos UI (basado en Material Design)
const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

// Convertir nuestra tipografía a la estructura esperada por MD3Theme
const typescale: MD3Typescale = {
  default: typography.default,
  displayLarge: typography.displayLarge,
  displayMedium: typography.displayMedium,
  displaySmall: typography.displaySmall,
  headlineLarge: typography.headlineLarge,
  headlineMedium: typography.headlineMedium,
  headlineSmall: typography.headlineSmall,
  titleLarge: typography.titleLarge,
  titleMedium: typography.titleMedium,
  titleSmall: typography.titleSmall,
  bodyLarge: typography.bodyLarge,
  bodyMedium: typography.bodyMedium,
  bodySmall: typography.bodySmall,
  labelLarge: typography.labelLarge,
  labelMedium: typography.labelMedium,
  labelSmall: typography.labelSmall,
};

// Crea y extiende el tema claro de Paper con nuestras personalizaciones
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  fonts: typescale,
  spacing,
  // Puedes añadir más propiedades personalizadas aquí
  roundness: 8, // Radio de borde para componentes
};

// Crea y extiende el tema oscuro de Paper con nuestras personalizaciones
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  fonts: typescale,
  spacing,
  // Puedes añadir más propiedades personalizadas aquí
  roundness: 8, // Radio de borde para componentes
};

// Tipo para los temas personalizados
export type AppTheme = typeof lightTheme;

// Helper para usar el tema en componentes (para tener autocompletado)
export const useAppTheme = () => useTheme() as AppTheme;
