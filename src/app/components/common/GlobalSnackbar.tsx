import React from "react";
import { StyleSheet } from "react-native";
import { Snackbar, Text } from "react-native-paper";
import {
  useSnackbarStore,
  SnackbarType,
} from "../../../app/store/snackbarStore";
import { useAppTheme } from "../../../app/styles/theme";

const GlobalSnackbar: React.FC = () => {
  const { visible, message, type, duration, hideSnackbar } = useSnackbarStore();
  const theme = useAppTheme(); // Obtiene el tema activo (light/dark)

  // Función para determinar el estilo basado en el tipo de snackbar
  const getSnackbarStyle = (snackbarType: SnackbarType) => {
    switch (snackbarType) {
      case "success":
        // Usa colores definidos en tu tema para éxito
        return { backgroundColor: theme.colors.successContainer };
      case "error":
        // Usa colores definidos en tu tema para error
        return { backgroundColor: theme.colors.errorContainer };
      case "warning":
        // Usa colores definidos en tu tema para advertencia
        return { backgroundColor: theme.colors.warningContainer };
      case "info":
        // Usa colores definidos en tu tema para información
        return { backgroundColor: theme.colors.infoContainer };
      default:
        return {};
    }
  };

  // Función para determinar el color del texto basado en el fondo para asegurar contraste
  const getSnackbarTextStyle = (snackbarType: SnackbarType) => {
    // Asegúrate de tener estos colores definidos en colors.ts y extendidos en theme.ts
    // Si no los tienes, puedes usar un color por defecto o calcular uno.
    const defaultTextColor = theme.dark
      ? theme.colors.surface
      : theme.colors.onSurface;

    const baseStyle = {
      fontSize: 16, // Tamaño de fuente más grande
      fontWeight: "500" as const, // Peso de fuente medio
      lineHeight: 24, // Altura de línea aumentada para mejor legibilidad
    };

    switch (snackbarType) {
      case "success":
        return {
          ...baseStyle,
          color: theme.colors.onSuccessContainer || defaultTextColor,
        };
      case "error":
        return {
          ...baseStyle,
          color: theme.colors.onErrorContainer,
        };
      case "warning":
        return {
          ...baseStyle,
          color: theme.colors.onWarningContainer || defaultTextColor,
        };
      case "info":
        return {
          ...baseStyle,
          color: theme.colors.onInfoContainer || defaultTextColor,
        };
      default:
        return {
          ...baseStyle,
          color: theme.colors.inverseOnSurface,
        };
    }
  };

  return (
    <Snackbar
      visible={visible}
      onDismiss={hideSnackbar}
      duration={duration}
      style={[styles.snackbarBase, getSnackbarStyle(type)]}
      theme={{ roundness: theme.roundness }}
    >
      <Text style={[styles.messageText, getSnackbarTextStyle(type)]}>
        {message}
      </Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  snackbarBase: {
    marginBottom: 16, // Margen inferior para separarlo del borde de la pantalla
    marginHorizontal: 16, // Márgenes horizontales
    minHeight: 56, // Altura mínima aumentada
    paddingVertical: 12, // Padding vertical aumentado
    paddingHorizontal: 16, // Padding horizontal aumentado
  },
  messageText: {
    flex: 1, // Permite que el texto ocupe todo el espacio disponible
    textAlign: "center", // Centra el texto
  },
});

export default GlobalSnackbar;
