import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore, useSystemThemeDetector } from "./src/store/themeStore";
import GlobalSnackbar from "./src/components/common/GlobalSnackbar";
import LoginScreen from "./src/screens/auth/LoginScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Crear una instancia de QueryClient para React Query
const queryClient = new QueryClient();

// Crear el stack navigator
const Stack = createNativeStackNavigator();

export default function App() {
  // Usar el tema global de la aplicación
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const isDarkMode = activeTheme.dark;

  // Detectar y actualizar el tema del sistema
  useSystemThemeDetector();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={activeTheme}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
            {/* Ajustar StatusBar según el tema */}
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            {/* Snackbar global accesible desde cualquier parte */}
            <GlobalSnackbar />
          </NavigationContainer>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
