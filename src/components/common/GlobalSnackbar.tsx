import React from "react";
import { StyleSheet } from "react-native";
import { Snackbar, useTheme } from "react-native-paper";

import { useSnackbarStore, SnackbarType } from "../../store/snackbarStore";

const GlobalSnackbar = () => {
  const theme = useTheme();

  // Obtener el estado del snackbar del store
  const { visible, message, type, duration, action, hideSnackbar } =
    useSnackbarStore();

  // Determinar la duración en base al tipo o al valor explícito pasado
  const getDuration = () => {
    // Si se proporciona una duración explícita, úsala
    if (duration) return duration;

    // De lo contrario, usa duraciones por defecto según el tipo
    switch (type) {
      case "error":
        return 6000; // Errores visibles por más tiempo
      case "success":
        return 3000; // Éxitos por tiempo medio
      case "info":
      case "warning":
        return 4000; // Info y advertencias por tiempo medio-largo
      default:
        return 4000; // Por defecto
    }
  };

  // Obtener el color de fondo según el tipo
  const getBackgroundColor = (type: SnackbarType) => {
    switch (type) {
      case "success":
        return theme.colors.success;
      case "error":
        return theme.colors.error;
      case "warning":
        return theme.colors.warning;
      case "info":
        return theme.colors.info;
      default:
        return undefined; // Usar el color por defecto de Paper
    }
  };

  // Obtener los estilos dinámicamente según el tipo
  const getStyles = () => {
    const backgroundColor = getBackgroundColor(type);

    return StyleSheet.create({
      snackbar: {
        backgroundColor,
      },
    });
  };

  const styles = getStyles();

  return (
    <Snackbar
      visible={visible}
      onDismiss={hideSnackbar}
      duration={getDuration()}
      style={styles.snackbar}
      action={action}
    >
      {message}
    </Snackbar>
  );
};

export default GlobalSnackbar;
