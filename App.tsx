import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore, useSystemThemeDetector } from './src/app/store/themeStore'; // Importar useSystemThemeDetector
import { AppNavigator } from './src/app/navigation/AppNavigator'; // Importar AppNavigator
import GlobalSnackbar from './src/app/components/common/GlobalSnackbar';

const queryClient = new QueryClient();

export default function App() {
  const activeTheme = useThemeStore((state) => state.activeTheme);
  // Llama al hook para detectar y actualizar el tema del sistema en el store
  useSystemThemeDetector();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={activeTheme}>
          {/* AppNavigator ya contiene NavigationContainer */}
          <AppNavigator />
          <GlobalSnackbar />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
