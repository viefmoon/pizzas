import React from 'react';
import { ActivityIndicator, View } from 'react-native'; // Añadir imports
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore, useSystemThemeDetector } from './src/app/store/themeStore'; // Restaurar importación de useSystemThemeDetector
import { AppNavigator } from './src/app/navigation/AppNavigator'; // Importar AppNavigator
import GlobalSnackbar from './src/app/components/common/GlobalSnackbar';
import { useInitializeAuth } from './src/app/hooks/useInitializeAuth'; // Importar el hook

const queryClient = new QueryClient();

export default function App() {
  // Usar el hook de inicialización de autenticación
  const isInitializingAuth = useInitializeAuth();
  const activeTheme = useThemeStore((state) => state.activeTheme);
  // Llama al hook para detectar y actualizar el tema del sistema en el store
  useSystemThemeDetector(); // Restaurar llamada al hook

  // Mostrar pantalla de carga mientras se inicializa la autenticación
  if (isInitializingAuth) {
    return (
      // Usar un View simple para la carga, podría ser un componente Splash Screen más elaborado
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: activeTheme.colors.background }}>
        <ActivityIndicator size="large" color={activeTheme.colors.primary} />
      </View>
    );
  }

  // Una vez inicializado, renderizar la app principal
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={activeTheme}>
          <AppNavigator />
          <GlobalSnackbar />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
