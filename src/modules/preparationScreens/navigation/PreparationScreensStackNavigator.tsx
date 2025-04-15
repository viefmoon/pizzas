import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PreparationScreensStackParamList } from './types';
import PreparationScreensScreen from '../screens/PreparationScreensScreen'; // Importar la pantalla principal
import { useAppTheme } from '../../../app/styles/theme';
// Importar DrawerToggleButton si se necesita (ej. si este stack es la pantalla inicial del drawer)
// import { DrawerToggleButton } from '@react-navigation/drawer';

const Stack = createNativeStackNavigator<PreparationScreensStackParamList>();

const PreparationScreensStackNavigator = () => {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="PreparationScreensList"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.elevation.level2, // Usar color de elevación del tema
        },
        headerTintColor: theme.colors.onSurface, // Color del texto y botones del header
        headerTitleStyle: {
          ...theme.fonts.titleMedium, // Usar fuente del tema
          fontWeight: 'bold',
        },
        // Descomentar si se quiere el botón del drawer en la pantalla principal de este stack
        // headerLeft: (props) => <DrawerToggleButton {...props} tintColor={theme.colors.onSurface} />,
      }}
    >
      <Stack.Screen
        name="PreparationScreensList"
        component={PreparationScreensScreen}
        options={{
          title: 'Pantallas de Preparación', // Título de la pantalla
        }}
      />
      {/* Añadir aquí otras pantallas si el módulo crece */}
      {/* <Stack.Screen name="PreparationScreenDetail" component={DetailScreenComponent} /> */}
    </Stack.Navigator>
  );
};

export default PreparationScreensStackNavigator;