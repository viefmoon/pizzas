import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersScreen from '../../modules/orders/screens/OrdersScreen'; // Importa la pantalla principal de órdenes
import CreateOrderScreen from '../../modules/orders/screens/CreateOrderScreen'; // Importa la pantalla de crear orden
import type { OrdersStackParamList } from './types'; // Importa los tipos del stack de órdenes
import { useAppTheme } from '../styles/theme'; // Importa el hook del tema

// Crea el Stack Navigator tipado
const Stack = createNativeStackNavigator<OrdersStackParamList>();

function OrdersStackNavigator() {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="Orders"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary }, // Ejemplo de estilo de header
        headerTintColor: theme.colors.onPrimary, // Color del texto del header
        headerTitleStyle: {
          // fontFamily: theme.fonts.medium.fontFamily, // Asegúrate que la fuente exista
        },
      }}
    >
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Órdenes' }} // Título para la pantalla principal
      />
      <Stack.Screen
        name="CreateOrder"
        component={CreateOrderScreen}
        options={{ title: 'Crear Nueva Orden' }} // Título para la pantalla de creación
      />
      {/* Aquí se añadirían otras pantallas del módulo de órdenes en el futuro */}
      {/* <Stack.Screen name="OrderDetail" component={OrderDetailScreen} /> */}
    </Stack.Navigator>
  );
}

export default OrdersStackNavigator;