import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Platform } from 'react-native';

import CategoriesScreen from '../screens/CategoriesScreen';
// Importar SubCategoriesScreen, ProductScreen, etc., cuando se creen
// import SubCategoriesScreen from '../screens/SubCategoriesScreen';

import { useAppTheme } from '../../../app/styles/theme'; // Ajustar ruta
import type { MenuStackParamList } from './types'; // Tipos específicos del stack

const Stack = createNativeStackNavigator<MenuStackParamList>();

export const MenuStack: React.FC = () => {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.elevation.level2, // Color de fondo del header
        },
        headerTintColor: theme.colors.onSurface, // Color del texto y botones del header
        headerTitleStyle: {
          // fontFamily: theme.fonts.titleLarge.fontFamily, // Ajustar según tu definición de fuentes
        },
        // Botón para abrir el Drawer en la pantalla principal del Stack
        headerLeft: (props) => Platform.OS !== 'web' ? <DrawerToggleButton {...props} tintColor={theme.colors.onSurface} /> : null,
      }}
    >
      <Stack.Screen
        name="CategoriesScreen"
        component={CategoriesScreen}
        options={{
          title: 'Categorías', // Título para la pantalla de categorías
        }}
      />
      {/* Añadir aquí otras pantallas del módulo Menu cuando existan */}
      {/*
      <Stack.Screen
        name="SubCategoriesScreen"
        component={SubCategoriesScreen}
        options={({ route }) => ({ title: `Subcategorías de ${route.params.categoryName}` })} // Título dinámico
      />
      */}
    </Stack.Navigator>
  );
};