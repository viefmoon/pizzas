// Define los estilos tipográficos según Material Design 3
// Estos valores se pueden ajustar según las necesidades específicas del diseño

import { Platform } from "react-native";

// Configuración de tipografía siguiendo Material Design 3
export const typography = {
  // Fuentes base para Android e iOS
  fonts: {
    regular: Platform.select({
      ios: "SF Pro Text",
      android: "Roboto",
      default: "System",
    }),
    medium: Platform.select({
      ios: "SF Pro Text-Medium",
      android: "Roboto-Medium",
      default: "System-Medium",
    }),
    light: Platform.select({
      ios: "SF Pro Text-Light",
      android: "Roboto-Light",
      default: "System-Light",
    }),
    thin: Platform.select({
      ios: "SF Pro Text-Thin",
      android: "Roboto-Thin",
      default: "System-Thin",
    }),
  },

  // Estilos de texto según MD3
  displayLarge: {
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Roboto",
      default: "System",
    }),
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Roboto",
      default: "System",
    }),
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Roboto",
      default: "System",
    }),
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Roboto",
      default: "System",
    }),
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Roboto",
      default: "System",
    }),
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: Platform.select({
      ios: "SF Pro Display",
      android: "Roboto",
      default: "System",
    }),
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: Platform.select({
      ios: "SF Pro Text",
      android: "Roboto",
      default: "System",
    }),
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: Platform.select({
      ios: "SF Pro Text",
      android: "Roboto-Medium",
      default: "System-Medium",
    }),
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: Platform.select({
      ios: "SF Pro Text",
      android: "Roboto-Medium",
      default: "System-Medium",
    }),
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelLarge: {
    fontFamily: Platform.select({
      ios: "SF Pro Text",
      android: "Roboto-Medium",
      default: "System-Medium",
    }),
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: Platform.select({
      ios: "SF Pro Text",
      android: "Roboto-Medium",
      default: "System-Medium",
    }),
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: Platform.select({
      ios: "SF Pro Text",
      android: "Roboto-Medium",
      default: "System-Medium",
    }),
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  bodyLarge: {
    fontFamily: Platform.select({
      ios: "SF Pro Text",
      android: "Roboto",
      default: "System",
    }),
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: Platform.select({
      ios: "SF Pro Text",
      android: "Roboto",
      default: "System",
    }),
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: Platform.select({
      ios: "SF Pro Text",
      android: "Roboto",
      default: "System",
    }),
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
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
