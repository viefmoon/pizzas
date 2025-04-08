// Define los estilos tipográficos según Material Design 3
// Estos valores se pueden ajustar según las necesidades específicas del diseño

import { MD3Type } from "react-native-paper/lib/typescript/types";

// Configuración de la tipografía según Material Design 3
export const typography: MD3Type = {
  // Fuentes de display (títulos grandes)
  displayLarge: {
    fontFamily: "sans-serif",
    fontSize: 57,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: "sans-serif",
    fontSize: 45,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: "sans-serif",
    fontSize: 36,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 44,
  },

  // Fuentes de título (headlines)
  headlineLarge: {
    fontFamily: "sans-serif",
    fontSize: 32,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: "sans-serif",
    fontSize: 28,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: "sans-serif",
    fontSize: 24,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 32,
  },

  // Fuentes para títulos de sección (title)
  titleLarge: {
    fontFamily: "sans-serif-medium",
    fontSize: 22,
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: "sans-serif-medium",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: "sans-serif-medium",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
    lineHeight: 20,
  },

  // Fuentes para cuerpo de texto (body)
  bodyLarge: {
    fontFamily: "sans-serif",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: "sans-serif",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: "sans-serif",
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.4,
    lineHeight: 16,
  },

  // Fuentes para etiquetas (label)
  labelLarge: {
    fontFamily: "sans-serif-medium",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: "sans-serif-medium",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: "sans-serif-medium",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    lineHeight: 16,
  },
};

// Si necesitas adaptar para Android vs iOS, puedes exportar variantes específicas:
export const iosFontFamily = {
  regular: "System",
  medium: "System",
  light: "System",
  thin: "System",
};

export const androidFontFamily = {
  regular: "sans-serif",
  medium: "sans-serif-medium",
  light: "sans-serif-light",
  thin: "sans-serif-thin",
};
