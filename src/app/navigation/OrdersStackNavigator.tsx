import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersScreen from '../../modules/orders/screens/OrdersScreen';
import CreateOrderScreen from '../../modules/orders/screens/CreateOrderScreen';
import type { OrdersStackParamList } from './types';
import { useAppTheme } from '../styles/theme';
import { getStackHeaderOptions } from './options';

// Crea el Stack Navigator tipado
const Stack = createNativeStackNavigator<OrdersStackParamList>();

function OrdersStackNavigator() {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="Orders"
      screenOptions={{
        ...getStackHeaderOptions(theme),
      }}
    >
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Órdenes' }}
      />
      <Stack.Screen
        name="CreateOrder"
        component={CreateOrderScreen}
        options={{ title: 'Crear Nueva Orden' }}
      />
      {/* Aquí se añadirían otras pantallas del módulo de órdenes en el futuro */}
      {/* <Stack.Screen name="OrderDetail" component={OrderDetailScreen} /> */}
    </Stack.Navigator>
  );
}

export default OrdersStackNavigator;