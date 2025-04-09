import React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import { useSnackbarStore, SnackbarType } from '../../store/snackbarStore';
import { useAppTheme } from '../../styles/theme'; // Importa tu hook de tema tipado

const GlobalSnackbar: React.FC = () => {
  // Lee el estado del store de Zustand
  const { visible, message, type, duration, action, hideSnackbar } = useSnackbarStore();
  const theme = useAppTheme(); // Obtiene el tema activo (light/dark)

  // Función para determinar el estilo basado en el tipo de snackbar
  const getSnackbarStyle = (snackbarType: SnackbarType) => {
    switch (snackbarType) {
      case 'success':
        // Usa colores definidos en tu tema para éxito
        return { backgroundColor: theme.colors.successContainer };
      case 'error':
        // Usa colores definidos en tu tema para error
        return { backgroundColor: theme.colors.errorContainer };
      case 'warning':
         // Usa colores definidos en tu tema para advertencia
        return { backgroundColor: theme.colors.warningContainer };
      case 'info':
         // Usa colores definidos en tu tema para información
        return { backgroundColor: theme.colors.infoContainer };
      case 'default':
      default:
        // Permite que Paper use su color por defecto o define uno si prefieres
        return {};
    }
  };

  // Función para determinar el color del texto basado en el fondo para asegurar contraste
   const getSnackbarTextStyle = (snackbarType: SnackbarType) => {
     // Asegúrate de tener estos colores definidos en colors.ts y extendidos en theme.ts
     // Si no los tienes, puedes usar un color por defecto o calcular uno.
     const defaultTextColor = theme.dark ? theme.colors.surface : theme.colors.onSurface; // O theme.colors.inverseOnSurface como usa Paper por defecto

     switch (snackbarType) {
       case 'success':
         // Deberías tener un color 'onSuccessContainer' en tu tema
         return { color: theme.colors.onSuccessContainer || defaultTextColor };
       case 'error':
         return { color: theme.colors.onErrorContainer }; // Paper ya define onErrorContainer
       case 'warning':
         return { color: theme.colors.onWarningContainer || defaultTextColor };
       case 'info':
         return { color: theme.colors.onInfoContainer || defaultTextColor };
       case 'default':
       default:
         // Para el Snackbar por defecto, Paper usa 'inverseOnSurface'
         return { color: theme.colors.inverseOnSurface };
     }
   };

  return (
    <Snackbar
      visible={visible}
      onDismiss={hideSnackbar} // Llama a la acción del store para ocultarlo
      duration={duration} // Paper usa Snackbar.DURATION_MEDIUM si es undefined
      action={action} // Pasa la acción si existe
      style={[styles.snackbarBase, getSnackbarStyle(type)]} // Aplica estilos base y de tipo
      theme={{ roundness: theme.roundness }} // Puedes pasar props del tema si es necesario
    >
      {/* Es mejor aplicar el color al texto directamente para asegurar contraste */}
      <Text style={getSnackbarTextStyle(type)}>{message}</Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  snackbarBase: {
    // Puedes añadir estilos base aquí si necesitas, ej: ajustar márgenes
    // position: 'absolute', // Asegúrate de que esté posicionado correctamente si es necesario
    // bottom: 0, // O donde quieras que aparezca
    // left: 0,
    // right: 0,
  },
  // No necesitas estilos de texto aquí si los aplicas dinámicamente
});

export default GlobalSnackbar;