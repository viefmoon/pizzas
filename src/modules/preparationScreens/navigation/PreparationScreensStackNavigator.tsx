import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { DrawerToggleButton } from '@react-navigation/drawer'; // Importar DrawerToggleButton
import { Platform } from 'react-native'; // Importar Platform
import { useAppTheme } from '../../../app/styles/theme';
import PreparationScreensScreen from '../screens/PreparationScreensScreen';

// Definir tipos para las rutas del stack
export type PreparationScreensStackParamList = {
  PreparationScreensList: undefined;
};

const Stack = createNativeStackNavigator<PreparationScreensStackParamList>();

const PreparationScreensStackNavigator = () => {
  const theme = useAppTheme();

  // Definir screenOptions base como un objeto para estilos comunes
  const baseScreenOptions: NativeStackNavigationOptions = {
    headerStyle: {
      backgroundColor: theme.colors.elevation.level2, // Usar elevation.level2 como en otros stacks
    },
    headerTintColor: theme.colors.onSurface, // Usar onSurface como en otros stacks
    headerTitleStyle: {
      ...theme.fonts.titleMedium, // Usar titleMedium como en MenuStack
      fontWeight: 'bold', // Mantener bold
    },
    // headerLeft se definirá por pantalla si necesita acceso a navigation
  };

  return (
    // Usar las opciones base para el Navigator
    <Stack.Navigator screenOptions={baseScreenOptions}>
      <Stack.Screen
        name="PreparationScreensList"
        component={PreparationScreensScreen}
        // Definir options como función para esta pantalla específica
        options={({ navigation }) => ({ // Recibe { navigation, route }
          title: 'Pantallas de Preparación',
          // Usar DrawerToggleButton como en otros stacks
        })}
      />
      {/* Otras pantallas del stack irían aquí */}
    </Stack.Navigator>
  );
};

export default PreparationScreensStackNavigator;