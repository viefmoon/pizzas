import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerToggleButton } from '@react-navigation/drawer'; // Importar el botón del drawer
import { Platform } from 'react-native'; // Para condicional OS
import { AreasTablesStackParamList } from './types';
import AreasScreen from '../screens/AreasScreen';
import TablesScreen from '../screens/TablesScreen';
import { useAppTheme } from '../../../app/styles/theme';

const Stack = createNativeStackNavigator<AreasTablesStackParamList>();

const AreasTablesStackNavigator = () => {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="AreasList"
      screenOptions={{ // Aplicar estilos consistentes con MenuStack
        headerStyle: {
          backgroundColor: theme.colors.elevation.level2, // Coincidir con MenuStack
        },
        headerTintColor: theme.colors.onSurface, // Coincidir con MenuStack
        headerTitleStyle: {
          ...theme.fonts.titleLarge, // Coincidir con MenuStack
          fontWeight: 'bold', // Coincidir con MenuStack
        },
        // headerBackTitleVisible: false, // Opción no válida para native-stack
      }}
    >
      <Stack.Screen
        name="AreasList"
        component={AreasScreen}
        options={{
          title: 'Áreas',
          // Añadir el botón del Drawer a la izquierda, igual que en MenuStack
          headerLeft: (props) =>
            Platform.OS !== 'web' ? (
              <DrawerToggleButton
                {...props}
                tintColor={theme.colors.onSurface} // Coincidir con MenuStack
              />
            ) : null,
        }}
      />
      <Stack.Screen
        name="TablesList"
        component={TablesScreen}
        options={({ route }) => ({
          // El título se establece dinámicamente basado en route.params
          title: `Mesas de ${route.params.areaName || 'Área'}`,
        })}
      />
      {/* Aquí podrías añadir pantallas de detalle si fueran necesarias dentro de este stack */}
    </Stack.Navigator>
  );
};

export default AreasTablesStackNavigator;