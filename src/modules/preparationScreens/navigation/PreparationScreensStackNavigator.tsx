import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
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
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: theme.colors.onPrimary,
    headerTitleStyle: {
      // fontWeight: 'bold', // Opcional
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
          // Configurar headerLeft aquí para usar navigation
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor={theme.colors.onPrimary} // Usar color del tema
              size={24}
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} // Acción para abrir drawer
            />
          ),
        })}
      />
      {/* Otras pantallas del stack irían aquí */}
    </Stack.Navigator>
  );
};

export default PreparationScreensStackNavigator;