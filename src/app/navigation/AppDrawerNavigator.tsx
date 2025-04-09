// src/app/navigation/AppDrawerNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import WelcomeScreen from '../../modules/home/screens/WelcomeScreen';
import { MenuStack } from '../../modules/menu/navigation/MenuStack'; // Importar el nuevo Stack
import { CustomDrawerContent } from './components/CustomDrawerContent';
import { useAppTheme } from '../styles/theme';
import type { AppDrawerParamList } from './types';

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export function AppDrawerNavigator() {
  const theme = useAppTheme();

  return (
    <Drawer.Navigator
      // Pasa el componente de contenido personalizado
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        // Estilos generales para las pantallas dentro del Drawer
        headerStyle: {
          backgroundColor: theme.colors.primary, // Color de fondo del header
        },
        headerTintColor: theme.colors.onPrimary, // Color del título y botones del header
        headerTitleStyle: {
          ...theme.fonts.titleLarge, // Estilo del título del header
        },
        // Estilos para el Drawer en sí (puedes ajustar más en CustomDrawerContent)
        drawerStyle: {
          backgroundColor: theme.colors.surface, // Fondo del drawer
          width: 260, // Ancho del drawer
        },
        drawerActiveTintColor: theme.colors.primary, // Color del texto/icono del item activo
        drawerInactiveTintColor: theme.colors.onSurfaceVariant, // Color del texto/icono inactivo
        drawerLabelStyle: {
          // marginLeft: -20, // Ajusta si usas iconos
          ...theme.fonts.labelLarge, // Estilo de la etiqueta del drawer item
        },
        // Ocultar el header por defecto si la pantalla tiene el suyo propio (como WelcomeScreen)
        headerShown: false,
      }}
    >
      {/* Define las pantallas del Drawer */}
      <Drawer.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          title: 'Bienvenida', // Título que podría aparecer en el header si se muestra
          // drawerIcon: ({ color, size }) => ( // Icono para el drawer item (manejado en CustomDrawerContent)
          //   <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          // ),
        }}
      />
      {/* Pantalla para el Módulo de Menú (Categorías, etc.) */}
      <Drawer.Screen
        name="Menu"
        component={MenuStack}
        options={{
          title: 'Menú', // Título para el Drawer Item (usado en CustomDrawerContent)
          // drawerIcon: ({ color, size }) => ( // Icono (manejado en CustomDrawerContent)
          //   <MaterialCommunityIcons name="food-fork-drink" color={color} size={size} />
          // ),
        }}
      />
      {/* Añade más pantallas aquí en el futuro */}
      {/* <Drawer.Screen name="Settings" component={SettingsScreen} /> */}
    </Drawer.Navigator>
  );
}