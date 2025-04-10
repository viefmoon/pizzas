// src/app/navigation/AppNavigator.tsx
import React, { useEffect } from "react"; // Importar useEffect
import {
  NavigationContainer,
  Theme as NavigationTheme,
} from "@react-navigation/native"; // Renombrar Theme para claridad
import { useAuthStore } from "../store/authStore";
import { AuthStack } from "./AuthStack"; // Renombraremos/crearemos este
import { AppDrawerNavigator } from "./AppDrawerNavigator";
import { useAppTheme } from "../styles/theme"; // Para el tema de Paper
import { initImageCache } from '../lib/imageCache'; // Importar initImageCache

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const paperTheme = useAppTheme(); // Obtener el tema de Paper

  // Inicializar caché de imágenes al montar
  useEffect(() => {
    initImageCache();
    // Aquí podrías añadir otras inicializaciones globales si las necesitas
  }, []); // Array vacío para que se ejecute solo una vez

  // Crear un tema compatible con @react-navigation/native mapeando colores y añadiendo fuentes
  const navigationTheme: NavigationTheme = {
    dark: paperTheme.dark,
    colors: {
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface, // Mapear 'card' a 'surface' de Paper
      text: paperTheme.colors.onBackground, // Mapear 'text' a 'onBackground' de Paper
      border: paperTheme.colors.outline, // Mapear 'border' a 'outline' de Paper
      notification: paperTheme.colors.error, // Mapear 'notification' a 'error' de Paper
    },
    // Incluir las fuentes del tema de Paper, ya que parece ser requerido
    // @ts-ignore - Ignoramos temporalmente si el tipo base no lo espera explícitamente,
    // pero la implementación subyacente podría usarlo. Ajustar si es necesario.
    fonts: paperTheme.fonts,
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <AppDrawerNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
